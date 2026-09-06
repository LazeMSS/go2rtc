package tuya

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"

	"github.com/AlexxIT/go2rtc/internal/api"
	"github.com/AlexxIT/go2rtc/internal/app"
	"github.com/AlexxIT/go2rtc/internal/streams"
	"github.com/AlexxIT/go2rtc/pkg/core"
	"github.com/AlexxIT/go2rtc/pkg/tuya"
)

type AccountConfig struct {
	Email    string `yaml:"email"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Region   string `yaml:"region"`
}

type TuyaAccountSummary struct {
	Email  string `json:"email"`
	Region string `json:"region"`
}

type TuyaResponse struct {
	Sources    []*api.Source       `json:"sources"`
	Account    *TuyaAccountSummary `json:"account,omitempty"`
	IsExisting bool                `json:"is_existing,omitempty"`
}

var (
	accounts map[string]AccountConfig
	mu       sync.RWMutex
)

func Init() {
	var v struct {
		Cfg map[string]any `yaml:"tuya"`
	}
	app.LoadConfig(&v)

	accounts = make(map[string]AccountConfig)

	if v.Cfg != nil {
		if u, ok := v.Cfg["username"].(string); ok && u != "" {
			p, _ := v.Cfg["password"].(string)
			r, _ := v.Cfg["region"].(string)
			accounts[u] = AccountConfig{Email: u, Username: u, Password: p, Region: r}
		} else if e, ok := v.Cfg["email"].(string); ok && e != "" {
			p, _ := v.Cfg["password"].(string)
			r, _ := v.Cfg["region"].(string)
			accounts[e] = AccountConfig{Email: e, Username: e, Password: p, Region: r}
		} else {
			for key, val := range v.Cfg {
				if m, ok := val.(map[string]any); ok {
					p, _ := m["password"].(string)
					r, _ := m["region"].(string)
					accounts[key] = AccountConfig{Email: key, Username: key, Password: p, Region: r}
				}
			}
		}
	}

	streams.HandleFunc("tuya", func(source string) (core.Producer, error) {
		source = checkTuyaSource(source)
		return tuya.Dial(source)
	})

	api.HandleFunc("api/tuya", apiTuya)
}

func checkTuyaSource(source string) string {
	u, err := url.Parse(source)
	if err != nil {
		return source
	}

	q := u.Query()
	if q.Get("email") != "" && q.Get("password") != "" {
		return source
	}

	mu.RLock()
	defer mu.RUnlock()

	if len(accounts) == 0 {
		return source
	}

	var account AccountConfig
	if accEmail := q.Get("account"); accEmail != "" {
		if a, ok := accounts[accEmail]; ok {
			account = a
		}
	}
	if account.Email == "" {
		for _, a := range accounts {
			account = a
			break
		}
	}

	if account.Email == "" {
		return source
	}

	if q.Get("device_id") == "" {
		if u.Hostname() != "" && !strings.Contains(u.Hostname(), ".") {
			q.Set("device_id", u.Hostname())
			if account.Region != "" {
				u.Host = account.Region
			}
		} else if p := strings.TrimPrefix(u.Path, "/"); p != "" {
			q.Set("device_id", p)
		}
	}

	if u.Hostname() == "" && account.Region != "" {
		u.Host = account.Region
	}

	q.Set("email", account.Email)
	q.Set("password", account.Password)
	u.RawQuery = q.Encode()

	return u.String()
}

func getTuyaRegion(region string) *tuya.Region {
	for _, r := range tuya.AvailableRegions {
		if r.Host == region {
			return &r
		}
	}
	return nil
}

func fetchTuyaDevices(tuyaRegion *tuya.Region, email, password string) ([]tuya.Device, error) {
	httpClient := tuya.CreateHTTPClientWithSession()

	_, err := login(httpClient, tuyaRegion.Host, email, password, tuyaRegion.Continent)
	if err != nil {
		return nil, fmt.Errorf("login failed: %v", err)
	}

	tuyaAPI, err := tuya.NewTuyaSmartApiClient(
		httpClient,
		tuyaRegion.Host,
		email,
		password,
		"",
	)
	if err != nil {
		return nil, err
	}

	var devices []tuya.Device

	homes, _ := tuyaAPI.GetHomeList()
	if homes != nil && len(homes.Result) > 0 {
		for _, home := range homes.Result {
			roomList, err := tuyaAPI.GetRoomList(strconv.Itoa(home.Gid))
			if err != nil {
				continue
			}

			for _, room := range roomList.Result {
				for _, device := range room.DeviceList {
					if (device.Category == "sp" || device.Category == "dghsxj") && !containsDevice(devices, device.DeviceId) {
						devices = append(devices, device)
					}
				}
			}
		}
	}

	sharedHomes, _ := tuyaAPI.GetSharedHomeList()
	if sharedHomes != nil && len(sharedHomes.Result.SecurityWebCShareInfoList) > 0 {
		for _, sharedHome := range sharedHomes.Result.SecurityWebCShareInfoList {
			for _, device := range sharedHome.DeviceInfoList {
				if (device.Category == "sp" || device.Category == "dghsxj") && !containsDevice(devices, device.DeviceId) {
					devices = append(devices, device)
				}
			}
		}
	}

	return devices, nil
}

func apiTuya(w http.ResponseWriter, r *http.Request) {
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
	region := query.Get("region")
	email := query.Get("email")
	password := query.Get("password")

	if email == "" || password == "" || region == "" {
		mu.RLock()
		if id := query.Get("id"); id != "" {
			if a, ok := accounts[id]; ok {
				email = a.Email
				password = a.Password
				region = a.Region
			}
		} else if len(accounts) == 1 {
			for _, a := range accounts {
				email = a.Email
				password = a.Password
				region = a.Region
				break
			}
		} else if len(accounts) > 1 {
			accountList := make([]string, 0, len(accounts))
			for id := range accounts {
				accountList = append(accountList, id)
			}
			mu.RUnlock()
			api.ResponseJSON(w, accountList)
			return
		}
		mu.RUnlock()
	}

	if email == "" || password == "" || region == "" {
		http.Error(w, "email, password and region are required", http.StatusBadRequest)
		return
	}

	tuyaRegion := getTuyaRegion(region)
	if tuyaRegion == nil {
		http.Error(w, fmt.Sprintf("invalid region: %s", region), http.StatusBadRequest)
		return
	}

	devices, err := fetchTuyaDevices(tuyaRegion, email, password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if len(devices) == 0 {
		http.Error(w, "no cameras found", http.StatusNotFound)
		return
	}

	mu.RLock()
	hasTopLevel := len(accounts) > 0
	mu.RUnlock()

	var items []*api.Source
	for _, device := range devices {
		var streamURL string
		if hasTopLevel {
			streamURL = fmt.Sprintf("tuya://%s?device_id=%s", tuyaRegion.Host, url.QueryEscape(device.DeviceId))
		} else {
			cleanQuery := url.Values{}
			cleanQuery.Set("device_id", device.DeviceId)
			cleanQuery.Set("email", email)
			cleanQuery.Set("password", password)
			streamURL = fmt.Sprintf("tuya://%s?%s", tuyaRegion.Host, cleanQuery.Encode())
		}

		items = append(items, &api.Source{
			Name: device.DeviceName,
			URL:  streamURL,
		})
	}

	api.ResponseJSON(w, &TuyaResponse{
		Sources: items,
		Account: &TuyaAccountSummary{
			Email:  email,
			Region: region,
		},
	})
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
	region := r.Form.Get("region")

	mu.RLock()
	existing, alreadyConfigured := accounts[email]
	mu.RUnlock()

	if password == "" && alreadyConfigured {
		password = existing.Password
	}
	if region == "" && alreadyConfigured {
		region = existing.Region
	}

	if email == "" || password == "" || region == "" {
		http.Error(w, "email, password and region are required", http.StatusBadRequest)
		return
	}

	tuyaRegion := getTuyaRegion(region)
	if tuyaRegion == nil {
		http.Error(w, fmt.Sprintf("invalid region: %s", region), http.StatusBadRequest)
		return
	}

	devices, err := fetchTuyaDevices(tuyaRegion, email, password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	isDuplicate := alreadyConfigured && existing.Password == password && existing.Region == region

	if !isDuplicate {
		var v struct {
			Cfg map[string]any `yaml:"tuya"`
		}
		app.LoadConfig(&v)

		if v.Cfg != nil && (v.Cfg["email"] == email || v.Cfg["username"] == email) {
			_ = app.PatchConfig([]string{"tuya", "password"}, password)
			_ = app.PatchConfig([]string{"tuya", "region"}, region)
		} else {
			cfg := map[string]string{
				"password": password,
				"region":   region,
			}
			if err := app.PatchConfig([]string{"tuya", email}, cfg); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		mu.Lock()
		accounts[email] = AccountConfig{
			Email:    email,
			Username: email,
			Password: password,
			Region:   region,
		}
		mu.Unlock()
	}

	var items []*api.Source
	for _, device := range devices {
		items = append(items, &api.Source{
			Name: device.DeviceName,
			URL:  fmt.Sprintf("tuya://%s?device_id=%s", tuyaRegion.Host, url.QueryEscape(device.DeviceId)),
		})
	}

	api.ResponseJSON(w, &TuyaResponse{
		Sources: items,
		Account: &TuyaAccountSummary{
			Email:  email,
			Region: region,
		},
		IsExisting: isDuplicate,
	})
}

func login(client *http.Client, serverHost, email, password, countryCode string) (*tuya.LoginResult, error) {
	tokenResp, err := getLoginToken(client, serverHost, email, countryCode)
	if err != nil {
		return nil, err
	}

	encryptedPassword, err := tuya.EncryptPassword(password, tokenResp.Result.PbKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt password: %v", err)
	}

	var loginResp *tuya.PasswordLoginResponse
	var url string

	loginReq := tuya.PasswordLoginRequest{
		CountryCode: countryCode,
		Passwd:      encryptedPassword,
		Token:       tokenResp.Result.Token,
		IfEncrypt:   1,
		Options:     `{"group":1}`,
	}

	if tuya.IsEmailAddress(email) {
		url = fmt.Sprintf("https://%s/api/private/email/login", serverHost)
		loginReq.Email = email
	} else {
		url = fmt.Sprintf("https://%s/api/private/phone/login", serverHost)
		loginReq.Mobile = email
	}

	loginResp, err = performLogin(client, url, loginReq, serverHost)

	if err != nil {
		return nil, err
	}

	if !loginResp.Success {
		return nil, errors.New(loginResp.ErrorMsg)
	}

	return &loginResp.Result, nil
}

func getLoginToken(client *http.Client, serverHost, username, countryCode string) (*tuya.LoginTokenResponse, error) {
	url := fmt.Sprintf("https://%s/api/login/token", serverHost)

	tokenReq := tuya.LoginTokenRequest{
		CountryCode: countryCode,
		Username:    username,
		IsUid:       false,
	}

	jsonData, err := json.Marshal(tokenReq)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Origin", fmt.Sprintf("https://%s", serverHost))
	req.Header.Set("Referer", fmt.Sprintf("https://%s/login", serverHost))
	req.Header.Set("X-Requested-With", "XMLHttpRequest")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp tuya.LoginTokenResponse
	if err = json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	if !tokenResp.Success {
		return nil, errors.New("tuya: " + tokenResp.Msg)
	}

	return &tokenResp, nil
}

func performLogin(client *http.Client, url string, loginReq tuya.PasswordLoginRequest, serverHost string) (*tuya.PasswordLoginResponse, error) {
	jsonData, err := json.Marshal(loginReq)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Origin", fmt.Sprintf("https://%s", serverHost))
	req.Header.Set("Referer", fmt.Sprintf("https://%s/login", serverHost))
	req.Header.Set("X-Requested-With", "XMLHttpRequest")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var loginResp tuya.PasswordLoginResponse
	if err := json.NewDecoder(resp.Body).Decode(&loginResp); err != nil {
		return nil, err
	}

	return &loginResp, nil
}

func containsDevice(devices []tuya.Device, deviceID string) bool {
	for _, device := range devices {
		if device.DeviceId == deviceID {
			return true
		}
	}
	return false
}
