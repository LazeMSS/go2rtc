package arenti

import (
	"testing"

	"github.com/AlexxIT/go2rtc/pkg/yaml"
	"github.com/stretchr/testify/require"
)

func TestExtractTarget(t *testing.T) {
	tests := []struct {
		rawURL   string
		expected string
	}{
		{"arenti://camera1", "camera1"},
		{"arenti://front%20door", "front door"},
		{"arenti://ppslaa00000000000000", "ppslaa00000000000000"},
		{"arenti:///camera1", "camera1"},
		{"arenti://user:pass@/camera1", "camera1"},
		{"arenti://user:pass@host/camera1", "camera1"},
		{"arenti://camera1?country=US", "camera1"},
	}

	for _, tc := range tests {
		t.Run(tc.rawURL, func(t *testing.T) {
			_, _, _, target, err := parseURL(tc.rawURL)
			require.NoError(t, err)
			require.Equal(t, tc.expected, target)
		})
	}
}

func TestConfigLoad(t *testing.T) {
	yamlStr := `
arenti:
  username: user@example.com
  password: "SecretPassword123!"
  country_code: US
`
	var v struct {
		Cfg map[string]any `yaml:"arenti"`
	}
	err := yaml.Unmarshal([]byte(yamlStr), &v)
	require.NoError(t, err)
	require.NotNil(t, v.Cfg)
	require.Equal(t, "user@example.com", v.Cfg["username"])
	require.Equal(t, "US", v.Cfg["country_code"])
}
