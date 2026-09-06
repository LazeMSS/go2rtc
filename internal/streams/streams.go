package streams

import (
	"errors"
	"net/url"
	"sync"
	"time"

	"github.com/AlexxIT/go2rtc/internal/api"
	"github.com/AlexxIT/go2rtc/internal/api/ws"
	"github.com/AlexxIT/go2rtc/internal/app"
	"github.com/AlexxIT/go2rtc/pkg/yaml"
	"github.com/rs/zerolog"
)

func Init() {
	var cfg struct {
		Streams map[string]any    `yaml:"streams"`
		Publish map[string]any    `yaml:"publish"`
		Preload map[string]string `yaml:"preload"`
	}

	app.LoadConfig(&cfg)

	log = app.GetLogger("streams")

	// Preserve stream order as defined in config files
	for _, conf := range app.Configs() {
		for _, name := range yaml.SectionKeys(conf, "streams") {
			if item, ok := cfg.Streams[name]; ok {
				if _, exists := streams[name]; !exists {
					streams[name] = NewStream(item)
					addStreamOrder(name)
				}
			}
		}
	}

	// Add any remaining streams (e.g. from CLI flags, env vars)
	for name, item := range cfg.Streams {
		if _, exists := streams[name]; !exists {
			streams[name] = NewStream(item)
			addStreamOrder(name)
		}
	}

	api.HandleFunc("api/streams", apiStreams)
	api.HandleFunc("api/streams.dot", apiStreamsDOT)
	api.HandleFunc("api/events", apiEvents)
	api.HandleFunc("api/preload", apiPreload)
	api.HandleFunc("api/schemes", apiSchemes)

	ws.HandleFunc("streams", wsStreamsHandler)

	if cfg.Publish == nil && cfg.Preload == nil {
		return
	}

	time.AfterFunc(time.Second, func() {
		// range for nil map is OK
		for name, dst := range cfg.Publish {
			if stream := Get(name); stream != nil {
				Publish(stream, dst)
			}
		}
		for name, rawQuery := range cfg.Preload {
			if err := AddPreload(name, rawQuery); err != nil {
				log.Error().Err(err).Caller().Send()
			}
		}
	})
}

func New(name string, sources ...string) (*Stream, error) {
	for _, source := range sources {
		if !HasProducer(source) {
			return nil, errors.New("streams: source not supported")
		}

		if err := Validate(source); err != nil {
			return nil, err
		}
	}

	stream := NewStream(sources)

	streamsMu.Lock()
	streams[name] = stream
	addStreamOrder(name)
	streamsMu.Unlock()

	notifyChange()

	return stream, nil
}

func Patch(name string, source string) (*Stream, error) {
	streamsMu.Lock()
	defer streamsMu.Unlock()

	// check if source links to some stream name from go2rtc
	if u, err := url.Parse(source); err == nil && u.Scheme == "rtsp" && len(u.Path) > 1 {
		rtspName := u.Path[1:]
		if stream, ok := streams[rtspName]; ok {
			if streams[name] != stream {
				// link (alias) streams[name] to streams[rtspName]
				streams[name] = stream
				addStreamOrder(name)
				notifyChange()
			}
			return stream, nil
		}
	}

	if stream, ok := streams[source]; ok {
		if name != source {
			// link (alias) streams[name] to streams[source]
			streams[name] = stream
			addStreamOrder(name)
			notifyChange()
		}
		return stream, nil
	}

	// check if src has supported scheme
	if !HasProducer(source) {
		return nil, errors.New("streams: source not supported")
	}

	if err := Validate(source); err != nil {
		return nil, err
	}

	// check an existing stream with this name
	if stream, ok := streams[name]; ok {
		stream.SetSource(source)
		notifyChange()
		return stream, nil
	}

	// create new stream with this name
	stream := NewStream(source)
	streams[name] = stream
	addStreamOrder(name)
	notifyChange()
	return stream, nil
}

func GetOrPatch(query url.Values) (*Stream, error) {
	// check if src param exists
	source := query.Get("src")
	if source == "" {
		return nil, errors.New("streams: source empty")
	}

	// check if src is stream name
	if stream := Get(source); stream != nil {
		return stream, nil
	}

	// check if name param provided
	if name := query.Get("name"); name != "" {
		return Patch(name, source)
	}

	// return new stream with src as name
	return Patch(source, source)
}

var log zerolog.Logger

// streams map

var streams = map[string]*Stream{}
var streamsOrder []string
var streamsMu sync.Mutex

func addStreamOrder(name string) {
	for _, n := range streamsOrder {
		if n == name {
			return
		}
	}
	streamsOrder = append(streamsOrder, name)
}

func removeStreamOrder(name string) {
	for i, n := range streamsOrder {
		if n == name {
			streamsOrder = append(streamsOrder[:i], streamsOrder[i+1:]...)
			break
		}
	}
}

func Get(name string) *Stream {
	streamsMu.Lock()
	defer streamsMu.Unlock()
	return streams[name]
}

func Delete(name string) {
	streamsMu.Lock()
	defer streamsMu.Unlock()
	delete(streams, name)
	removeStreamOrder(name)
	notifyChange()
}

func GetAllNames() []string {
	streamsMu.Lock()
	defer streamsMu.Unlock()
	names := make([]string, len(streamsOrder))
	copy(names, streamsOrder)
	return names
}

func GetAllSources() map[string][]string {
	streamsMu.Lock()
	defer streamsMu.Unlock()
	sources := make(map[string][]string, len(streams))
	for _, name := range streamsOrder {
		if stream := streams[name]; stream != nil {
			sources[name] = stream.Sources()
		}
	}
	return sources
}
