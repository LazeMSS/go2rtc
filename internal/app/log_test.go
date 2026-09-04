package app

import (
	"bytes"
	"testing"
	"time"
)

func TestCircularBuffer_Subscribe(t *testing.T) {
	buf := newBuffer()

	ch, unsubscribe := buf.Subscribe(64)
	defer unsubscribe()

	testLine := []byte("{\"level\":\"info\",\"message\":\"test line 1\"}\n")
	n, err := buf.Write(testLine)
	if err != nil {
		t.Fatalf("Write error: %v", err)
	}
	if n != len(testLine) {
		t.Fatalf("Expected %d bytes, got %d", len(testLine), n)
	}

	select {
	case received := <-ch:
		if !bytes.Equal(received, testLine) {
			t.Errorf("Expected %q, got %q", testLine, received)
		}
	case <-time.After(500 * time.Millisecond):
		t.Fatal("Timeout waiting for broadcasted log line")
	}

	// Test unsubscribe
	unsubscribe()

	// Another write should not panic or block
	_, _ = buf.Write([]byte("{\"level\":\"info\",\"message\":\"after unsub\"}\n"))
}

func TestCircularBuffer_ResetBroadcast(t *testing.T) {
	buf := newBuffer()

	ch, unsubscribe := buf.Subscribe(64)
	defer unsubscribe()

	buf.Reset()

	select {
	case received := <-ch:
		if !bytes.Contains(received, []byte("clear")) {
			t.Errorf("Expected clear notification, got %q", received)
		}
	case <-time.After(500 * time.Millisecond):
		t.Fatal("Timeout waiting for clear notification")
	}
}
