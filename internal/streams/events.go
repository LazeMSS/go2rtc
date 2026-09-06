package streams

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/AlexxIT/go2rtc/internal/api/ws"
	"github.com/AlexxIT/go2rtc/pkg/creds"
)

var (
	eventsMu    sync.RWMutex
	listeners   = make(map[chan struct{}]struct{})
	notifyTimer *time.Timer
	notifyMu    sync.Mutex
)

// notifyChange triggers a debounced notification to all event listeners
func notifyChange() {
	notifyMu.Lock()
	defer notifyMu.Unlock()

	if notifyTimer != nil {
		notifyTimer.Stop()
	}
	notifyTimer = time.AfterFunc(50*time.Millisecond, func() {
		eventsMu.RLock()
		for ch := range listeners {
			select {
			case ch <- struct{}{}:
			default:
			}
		}
		eventsMu.RUnlock()
	})
}

func addListener(ch chan struct{}) {
	eventsMu.Lock()
	listeners[ch] = struct{}{}
	eventsMu.Unlock()
}

func removeListener(ch chan struct{}) {
	eventsMu.Lock()
	delete(listeners, ch)
	eventsMu.Unlock()
}

func getStreamsJSON() []byte {
	streamsMu.Lock()
	defer streamsMu.Unlock()

	var b bytes.Buffer
	b.WriteByte('{')
	first := true
	for _, name := range streamsOrder {
		stream, ok := streams[name]
		if !ok {
			continue
		}
		data, err := json.Marshal(stream)
		if err != nil {
			continue
		}
		if !first {
			b.WriteByte(',')
		}
		first = false

		key, _ := json.Marshal(name)
		b.Write(key)
		b.WriteByte(':')
		b.Write(data)
	}
	for name, stream := range streams {
		found := false
		for _, n := range streamsOrder {
			if n == name {
				found = true
				break
			}
		}
		if !found {
			data, err := json.Marshal(stream)
			if err != nil {
				continue
			}
			if !first {
				b.WriteByte(',')
			}
			first = false
			key, _ := json.Marshal(name)
			b.Write(key)
			b.WriteByte(':')
			b.Write(data)
		}
	}
	b.WriteByte('}')
	return b.Bytes()
}

func apiEvents(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Send initial state immediately
	initialData := creds.SecretString(string(getStreamsJSON()))
	_, _ = fmt.Fprintf(w, "event: streams\ndata: %s\n\n", initialData)
	flusher.Flush()

	ch := make(chan struct{}, 1)
	addListener(ch)
	defer func() {
		removeListener(ch)
		close(ch)
	}()

	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
			// Keepalive ping for reverse proxies / ingress
			_, _ = fmt.Fprintf(w, ": ping\n\n")
			flusher.Flush()
		case <-ch:
			data := creds.SecretString(string(getStreamsJSON()))
			_, _ = fmt.Fprintf(w, "event: streams\ndata: %s\n\n", data)
			flusher.Flush()
		}
	}
}

func wsStreamsHandler(tr *ws.Transport, msg *ws.Message) error {
	// Send initial state immediately
	data := creds.SecretString(string(getStreamsJSON()))
	tr.Write(&ws.Message{Type: "streams", Value: json.RawMessage(data)})

	ch := make(chan struct{}, 1)
	addListener(ch)

	tr.OnClose(func() {
		removeListener(ch)
	})

	go func() {
		for range ch {
			d := creds.SecretString(string(getStreamsJSON()))
			tr.Write(&ws.Message{Type: "streams", Value: json.RawMessage(d)})
		}
	}()

	return nil
}
