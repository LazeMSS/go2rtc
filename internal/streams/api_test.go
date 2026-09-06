package streams

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/AlexxIT/go2rtc/pkg/core"
	"github.com/stretchr/testify/require"
)

func TestApiSchemes(t *testing.T) {
	// Setup: Register some test handlers and redirects
	HandleFunc("rtsp", func(url string) (core.Producer, error) { return nil, nil })
	HandleFunc("rtmp", func(url string) (core.Producer, error) { return nil, nil })
	RedirectFunc("http", func(url string) (string, error) { return "", nil })

	t.Run("GET request returns schemes", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/schemes", nil)
		w := httptest.NewRecorder()

		apiSchemes(w, req)

		require.Equal(t, http.StatusOK, w.Code)
		require.Equal(t, "application/json", w.Header().Get("Content-Type"))

		var schemes []string
		err := json.Unmarshal(w.Body.Bytes(), &schemes)
		require.NoError(t, err)
		require.NotEmpty(t, schemes)

		// Check that our test schemes are in the response
		require.Contains(t, schemes, "rtsp")
		require.Contains(t, schemes, "rtmp")
		require.Contains(t, schemes, "http")
	})
}

func TestApiSchemesNoDuplicates(t *testing.T) {
	// Setup: Register a scheme in both handlers and redirects
	HandleFunc("duplicate", func(url string) (core.Producer, error) { return nil, nil })
	RedirectFunc("duplicate", func(url string) (string, error) { return "", nil })

	req := httptest.NewRequest("GET", "/api/schemes", nil)
	w := httptest.NewRecorder()

	apiSchemes(w, req)

	require.Equal(t, http.StatusOK, w.Code)

	var schemes []string
	err := json.Unmarshal(w.Body.Bytes(), &schemes)
	require.NoError(t, err)

	// Count occurrences of "duplicate"
	count := 0
	for _, scheme := range schemes {
		if scheme == "duplicate" {
			count++
		}
	}

	// Should only appear once
	require.Equal(t, 1, count, "scheme 'duplicate' should appear exactly once")
}

func TestStreamsOrder(t *testing.T) {
	streamsMu.Lock()
	// Clear any existing test streams
	streams = map[string]*Stream{}
	streamsOrder = nil
	streamsMu.Unlock()

	// Add in non-alphabetical order: zulu, alpha, mike
	streamsMu.Lock()
	streams["zulu"] = NewStream(nil)
	addStreamOrder("zulu")
	streams["alpha"] = NewStream(nil)
	addStreamOrder("alpha")
	streams["mike"] = NewStream(nil)
	addStreamOrder("mike")
	streamsMu.Unlock()

	require.Equal(t, []string{"zulu", "alpha", "mike"}, GetAllNames())

	req := httptest.NewRequest("GET", "/api/streams", nil)
	w := httptest.NewRecorder()
	apiStreams(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	body := w.Body.String()

	// Verify order in JSON output
	posZulu := strings.Index(body, `"zulu"`)
	posAlpha := strings.Index(body, `"alpha"`)
	posMike := strings.Index(body, `"mike"`)

	require.Greater(t, posAlpha, posZulu, "alpha should appear after zulu in JSON")
	require.Greater(t, posMike, posAlpha, "mike should appear after alpha in JSON")

	// Test Delete removes from order
	Delete("alpha")
	require.Equal(t, []string{"zulu", "mike"}, GetAllNames())

	// Cleanup
	Delete("zulu")
	Delete("mike")
}
