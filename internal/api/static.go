package api

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/AlexxIT/go2rtc/internal/app"
	"github.com/AlexxIT/go2rtc/www"
)

const defaultCSP = "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: blob:; media-src 'self' blob: data:; connect-src 'self' ws: wss: blob: data: https://cdn.jsdelivr.net; worker-src 'self' blob: data: https://cdn.jsdelivr.net; font-src 'self' data: https://cdn.jsdelivr.net; object-src 'none'; base-uri 'self'"

var cspHeader = defaultCSP

func initStatic(staticDir string) {
	var root http.FileSystem
	if staticDir != "" {
		log.Info().Str("dir", staticDir).Msg("[api] serve static")
		root = http.Dir(staticDir)
	} else if dir := findLocalWWW(); dir != "" {
		log.Info().Str("dir", dir).Msg("[api] serve static")
		root = http.Dir(dir)
	} else {
		root = http.FS(www.Static)
	}

	base := len(basePath)
	fileServer := http.FileServer(root)

	HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		if base > 0 {
			r.URL.Path = r.URL.Path[base:]
		}
		w.Header().Set("Cache-Control", "no-cache")
		if cspHeader != "" {
			w.Header().Set("Content-Security-Policy", cspHeader)
		}
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		fileServer.ServeHTTP(w, r)
	})
}

func findLocalWWW() string {
	candidates := []string{"www"}
	if app.ConfigPath != "" {
		candidates = append(candidates, filepath.Join(filepath.Dir(app.ConfigPath), "www"))
	}
	if exe, err := os.Executable(); err == nil {
		candidates = append(candidates, filepath.Join(filepath.Dir(exe), "www"))
	}
	for _, dir := range candidates {
		if fi, err := os.Stat(dir); err == nil && fi.IsDir() {
			if _, err := os.Stat(filepath.Join(dir, "index.html")); err == nil {
				return dir
			}
		}
	}
	return ""
}
