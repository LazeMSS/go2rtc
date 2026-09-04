package www

import "embed"

//go:embed *.html
//go:embed *.json
//go:embed *.css
//go:embed *.ico
//go:embed *.png
//go:embed js
var Static embed.FS
