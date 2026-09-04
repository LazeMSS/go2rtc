package streams

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestEvents(t *testing.T) {
	streamsMu.Lock()
	streams["test_stream"] = NewStream(nil)
	streamsMu.Unlock()

	req := httptest.NewRequest("GET", "/api/events", nil)
	ctx, cancel := context.WithCancel(req.Context())
	req = req.WithContext(ctx)

	w := httptest.NewRecorder()

	done := make(chan struct{})
	go func() {
		apiEvents(w, req)
		close(done)
	}()

	time.Sleep(100 * time.Millisecond)

	notifyChange()
	time.Sleep(150 * time.Millisecond)

	cancel()
	<-done

	body := w.Body.String()
	require.True(t, strings.Contains(body, "event: streams"))
	require.True(t, strings.Contains(body, "test_stream"))

	streamsMu.Lock()
	delete(streams, "test_stream")
	streamsMu.Unlock()
}
