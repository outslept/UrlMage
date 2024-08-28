# UrlMage 🧙‍♂️

UrlMage is a powerful and flexible URL manipulation library for TypeScript and JavaScript. It provides a comprehensive set of methods to parse, manipulate, and transform URLs with ease.

## Features

- 🔧 Parse and manipulate URL components (protocol, hostname, path, query parameters, etc.)
- 🔄 Transform URLs between different formats (e.g., HTTP to HTTPS, market: to Play Store)
- 🔍 Extract information from specialized URLs (e.g., magnet links, geo URLs, FaceTime)
- 🛡️ Validate URLs for specific protocols and formats
- 🧹 Normalize and clean URLs
- 🔗 Handle various URL schemes (http, https, ftp, mailto, tel, sms, and more)

## Usage

```ts
import { UrlMage } from 'urlmage'

const url = new UrlMage('https://example.com/path?query=value#hash')

// Manipulate URL components
url
  .setProtocol('http')
  .setHostname('newexample.com')
  .addQueryParam('newParam', 'newValue')
  .removeHash()

console.log(url.toString())
// Output: http://newexample.com/path?query=value&newParam=newValue

// Transform URLs
const gitUrl = new UrlMage('git@github.com:user/repo.git')
gitUrl.gitUrlToHttps()
console.log(gitUrl.toString())
// Output: https://github.com/user/repo

// Validate URLs
const wsUrl = new UrlMage('ws://example.com/socket')
console.log(wsUrl.isValidWebSocketUrl()) // true

// Extract information
const geoUrl = new UrlMage('geo:37.786971,-122.399677')
console.log(geoUrl.extractGeoCoordinates()) // [37.786971, -122.399677]
```

## API Documentation

For detailed API documentation, please refer to the [API.md](/API.md) file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
