# UrlMage 🧙‍♂️

UrlMage is a powerful, lightweight, and dependency-free URL manipulation library for TypeScript and JavaScript. It provides a robust and intuitive API for parsing, modifying, and constructing URLs with ease.

## 🚀 Features

- 🔧 Comprehensive URL manipulation (protocol, domain, path, query, hash)
- 🔍 Advanced parsing and analysis
- 🔗 Fluent interface for method chaining
- 🔒 Type-safe operations with TypeScript
- 🧩 Modular design for easy integration
- 🏗️ Static utility methods for common operations

## 📦 Installation

```ts
npm install urlmage
```

## 🔧 Usage

```ts
import { UrlMage } from "urlmage";

const url = new UrlMage("https://example.com/path?query=value#hash");

// Modify URL components
url
  .setProtocol("http")
  .setDomain("newdomain.com")
  .addPathSegment("newpath")
  .setQuery("newquery", "newvalue")
  .setHash("newhash");

console.log(url.toString());
// Output: http://newdomain.com/path/newpath?query=value&newquery=newvalue#newhash

// Analyze URL
console.log(url.domain); // newdomain.com
console.log(url.getSegments()); // ['path', 'newpath']
console.log(url.query); // { query: 'value', newquery: 'newvalue' }

// Use static methods
console.log(UrlMage.isValid("https://example.com")); // true
console.log(UrlMage.combine("/path", "to", "/resource")); // /path/to/resource
```

## 📘 API Reference

### Constructor

`constructor(url: string)`

### Getters

`protocol: string`

`domain: string`

`path: string`

`query: Record<string, string>`

### Setters

`setProtocol(protocol: string): UrlMage`

`setDomain(domain: string): UrlMage`

`setPath(path: string): UrlMage`

`setQuery(key: string, value: QueryValue): UrlMage`

### Advanced Methods

`addPathSegment(segment: string): UrlMage`

`removeLastPathSegment(): UrlMage`

`setQueryObject(queryObject: Record<string, QueryValue>): UrlMage`

`appendQuery(key: string, value: QueryValue): UrlMage`

`getQueryArray(key: string): string[]`

`toggleQueryParam(key: string, value: string): UrlMage`

`normalizeProtocol(): UrlMage`

`normalizeDomain(): UrlMage`

`removeTrailingSlash(): UrlMage`

`getSegments(): string[]`

`isSubdomainOf(domain: string): boolean`

`swapProtocol(newProtocol: string): UrlMage`

`removeQuery(key: string): UrlMage`

`encode(): string`

`decode(): string`

`toString(): string`

`clone(): UrlMage`

### Utility Methods

`getOrigin(): string`

`hasQueryParam(key: string): boolean`

`getPort(): string`

`setPort(port: number): UrlMage`

`removePort(): UrlMage`

`getHash(): string`

`setHash(hash: string): UrlMage`

`removeHash(): UrlMage`

`isAbsolute(): boolean`

`isRelative(): boolean`

### Static Methods

`isValid(url: string): boolean`

`combine(...parts: string[]): string`

`fromObject(urlObject: UrlObject): UrlMage`

`parseQuery(queryString: string): Record<string, string | string[]>`

## 🧪 Types

```ts
type QueryValue = string | number | boolean | null | undefined;

interface UrlObject {
  protocol?: string;
  domain: string;
  path?: string;
  query?: Record<string, QueryValue>;
  hash?: string;
}
```