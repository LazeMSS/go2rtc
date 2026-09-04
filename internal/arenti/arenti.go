package arenti

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/AlexxIT/go2rtc/internal/api"
	"github.com/AlexxIT/go2rtc/internal/app"
	"github.com/AlexxIT/go2rtc/internal/streams"
	"github.com/AlexxIT/go2rtc/pkg/arenti"
	"github.com/AlexxIT/go2rtc/pkg/core"
)

type AccountConfig struct {
	Username    string `yaml:"username"`
	Password    string `yaml:"password"`
	CountryCode string `yaml:"country_code"`
	Region      string `yaml:"region"`
	Server      string `yaml:"server"`
}

var (
	accounts map[string]AccountConfig
	clients  map[string]*arenti.Client
	mu       sync.RWMutex
)

func Init() {
	var v struct {
		Cfg map[string]any `yaml:"arenti"`
	}
	app.LoadConfig(&v)

	accounts = make(map[string]AccountConfig)
	clients = make(map[string]*arenti.Client)

	if v.Cfg != nil {
		if u, ok := v.Cfg["username"].(string); ok && u != "" {
			p, _ := v.Cfg["password"].(string)
			c, _ := v.Cfg["country_code"].(string)
			if c == "" {
				c = "US"
			}
			reg, _ := v.Cfg["region"].(string)
			srv, _ := v.Cfg["server"].(string)
			accounts[u] = AccountConfig{
				Username:    u,
				Password:    p,
				CountryCode: c,
				Region:      reg,
				Server:      srv,
			}
		} else {
			for key, val := range v.Cfg {
				if m, ok := val.(map[string]any); ok {
					p, _ := m["password"].(string)
					c, _ := m["country_code"].(string)
					if c == "" {
						c = "US"
					}
					reg, _ := m["region"].(string)
					srv, _ := m["server"].(string)
					accounts[key] = AccountConfig{
						Username:    key,
						Password:    p,
						CountryCode: c,
						Region:      reg,
						Server:      srv,
					}
				}
			}
		}
	}

	log := app.GetLogger("arenti")
	arenti.Log = func(format string, a ...any) {
		log.Debug().Msgf(format, a...)
	}

	streams.HandleFunc("arenti", func(rawURL string) (core.Producer, error) {
		log.Debug().Msgf("arenti: dial %s", rawURL)
		return dialProducer(rawURL)
	})

	api.HandleFunc("api/arenti", apiArenti)
}

func getClient(email string) (*arenti.Client, error) {
	mu.Lock()
	defer mu.Unlock()

	if client, ok := clients[email]; ok {
		return client, nil
	}

	cfg, ok := accounts[email]
	if !ok {
		return nil, fmt.Errorf("arenti: account not configured: %s", email)
	}

	client := arenti.NewClient(cfg.Username, cfg.Password, cfg.CountryCode)
	if cfg.Server != "" {
		client.SetBaseURL(cfg.Server)
	} else if cfg.Region != "" {
		client.SetRegion(cfg.Region)
	}

	if err := client.Login(); err != nil {
		return nil, err
	}

	clients[email] = client
	return client, nil
}

func parseURL(rawURL string) (accountEmail, password, country, region, server, target string, err error) {
	s := strings.TrimPrefix(rawURL, "arenti://")
	s = strings.TrimPrefix(s, "arenti:")

	// Check query string
	if idx := strings.IndexByte(s, '?'); idx != -1 {
		q, _ := url.ParseQuery(s[idx+1:])
		country = q.Get("country")
		region = q.Get("region")
		server = q.Get("server")
		if acc := q.Get("account"); acc != "" {
			accountEmail = acc
		}
		s = s[:idx]
	}

	// Check user:pass@
	if idx := strings.IndexByte(s, '@'); idx != -1 {
		userinfo := s[:idx]
		s = s[idx+1:]
		if uidx := strings.IndexByte(userinfo, ':'); uidx != -1 {
			accountEmail = userinfo[:uidx]
			password = userinfo[uidx+1:]
		} else {
			accountEmail = userinfo
		}
	}

	// If contains slash (e.g. "/boat cam" or "host/boat cam" or "web-eu.arenti.net/boat cam")
	if idx := strings.LastIndexByte(s, '/'); idx != -1 {
		s = s[idx+1:]
	}

	if unescaped, err := url.QueryUnescape(s); err == nil && unescaped != "" {
		s = unescaped
	}
	target = strings.TrimSpace(s)
	if target == "" {
		return "", "", "", "", "", "", errors.New("arenti: missing camera name or serial in url")
	}

	return accountEmail, password, country, region, server, target, nil
}

func dialProducer(rawURL string) (core.Producer, error) {
	accountEmail, password, country, region, server, target, err := parseURL(rawURL)
	if err != nil {
		return nil, err
	}

	var client *arenti.Client

	if password != "" {
		client = arenti.NewClient(accountEmail, password, country)
		if server != "" {
			client.SetBaseURL(server)
		} else if region != "" {
			client.SetRegion(region)
		}
		if err := client.Login(); err != nil {
			return nil, err
		}
	} else {
		// Lookup configured account
		if accountEmail == "" {
			mu.RLock()
			for email := range accounts {
				accountEmail = email
				break
			}
			mu.RUnlock()
		}

		if accountEmail == "" {
			return nil, errors.New("arenti: no account configured in go2rtc.yaml")
		}

		client, err = getClient(accountEmail)
		if err != nil {
			return nil, err
		}
	}

	dev, err := client.GetDevice(target)
	if err != nil {
		return nil, err
	}

	return arenti.NewProducer(client, dev, rawURL)
}

func apiArenti(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		apiDeviceList(w, r)
	case http.MethodPost:
		apiAuth(w, r)
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
	}
}

func apiDeviceList(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	email := query.Get("id")

	if email == "" {
		mu.RLock()
		count := len(accounts)
		if count == 1 {
			for id := range accounts {
				email = id
				break
			}
		} else if count > 1 {
			accountList := make([]string, 0, count)
			for id := range accounts {
				accountList = append(accountList, id)
			}
			mu.RUnlock()
			api.ResponseJSON(w, accountList)
			return
		}
		mu.RUnlock()
	}

	if email == "" {
		http.Error(w, "arenti: no account configured", http.StatusBadRequest)
		return
	}

	client, err := getClient(email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	devices, err := client.GetDevices()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var items []*api.Source
	for _, dev := range devices {
		infoParts := []string{dev.Model}
		if dev.Battery > 0 {
			infoParts = append(infoParts, fmt.Sprintf("battery: %d%%", dev.Battery))
		}
		if dev.WifiStrength > 0 {
			infoParts = append(infoParts, fmt.Sprintf("wifi: %d%%", dev.WifiStrength))
		}

		items = append(items, &api.Source{
			Name: dev.DeviceName,
			Info: strings.Join(infoParts, " | "),
			URL:  fmt.Sprintf("arenti://%s", dev.DeviceName),
		})
	}

	api.ResponseSources(w, items)
}

func apiAuth(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	email := r.Form.Get("email")
	if email == "" {
		email = r.Form.Get("username")
	}
	password := r.Form.Get("password")
	countryCode := r.Form.Get("country_code")
	if countryCode == "" {
		countryCode = "US"
	}
	region := r.Form.Get("region")
	server := r.Form.Get("server")

	if email == "" || password == "" {
		http.Error(w, "username and password required", http.StatusBadRequest)
		return
	}

	client := arenti.NewClient(email, password, countryCode)
	if server != "" {
		client.SetBaseURL(server)
	} else if region != "" {
		client.SetRegion(region)
	}
	if err := client.Login(); err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	cfg := map[string]string{
		"password":     password,
		"country_code": countryCode,
	}
	if region != "" {
		cfg["region"] = region
	}
	if server != "" {
		cfg["server"] = server
	}

	if err := app.PatchConfig([]string{"arenti", email}, cfg); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	mu.Lock()
	accounts[email] = AccountConfig{
		Username:    email,
		Password:    password,
		CountryCode: countryCode,
		Region:      region,
		Server:      server,
	}
	clients[email] = client
	mu.Unlock()

	devices, err := client.GetDevices()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var items []*api.Source
	for _, dev := range devices {
		infoParts := []string{dev.Model}
		if dev.Battery > 0 {
			infoParts = append(infoParts, fmt.Sprintf("battery: %d%%", dev.Battery))
		}
		if dev.WifiStrength > 0 {
			infoParts = append(infoParts, fmt.Sprintf("wifi: %d%%", dev.WifiStrength))
		}

		items = append(items, &api.Source{
			Name: dev.DeviceName,
			Info: strings.Join(infoParts, " | "),
			URL:  fmt.Sprintf("arenti://%s", dev.DeviceName),
		})
	}

	api.ResponseSources(w, items)
}
