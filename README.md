# UrlMage

UrlMage is a URL manipulation thing for TypeScript and JavaScript, providing a robust and intuitive API for parsing, modifying, and constructing URLs. 

## Features

- Parse URLs into their component parts
- Modify URL components (protocol, domain, path, query parameters, hash)
- Construct URLs from objects
- Normalize and clean URLs
- Handle query parameters with ease, including array parameters
- Encode and decode URL components
- Chainable methods for fluent API usage

## Basic Usage 

```ts
import { UrlMage } from 'urlmage';

const url = new UrlMage('https://example.com/path?query=value#hash');

console.log(url.protocol); // 'https'
console.log(url.domain); // 'example.com'
console.log(url.path); // '/path'
console.log(url.query); // { query: 'value' }
console.log(url.getHash()); // 'hash'
```

## Modyfying URLs

```ts
const url = new UrlMage('https://example.com');

url.setProtocol('http')
   .setDomain('newexample.com')
   .setPath('/new/path')
   .setQuery('newParam', 'newValue')
   .setHash('newSection');

console.log(url.toString()); // 'http://newexample.com/new/path?newParam=newValue#newSection'
```

## Working with Query Parameters

```ts
const url = new UrlMage('https://example.com');

url.appendQuery('arrayParam', 'value1')
   .appendQuery('arrayParam', 'value2');

console.log(url.getQueryArray('arrayParam')); // ['value1', 'value2']

url.toggleQueryParam('toggleParam', 'on');
console.log(url.toString()); // 'https://example.com?arrayParam=value1&arrayParam=value2&toggleParam=on'

url.toggleQueryParam('toggleParam', 'on');
console.log(url.toString()); // 'https://example.com?arrayParam=value1&arrayParam=value2'
```

## URL Normalization

```ts
const messyUrl = new UrlMage('HTTPS://ExAmPlE.CoM/PATH///to/page/');
messyUrl.normalizeProtocol().normalizeDomain().removeTrailingSlash();

console.log(messyUrl.toString()); // 'https://example.com/PATH/to/page'
```

## API Reference

### Constructor

- new UrlMage(url: string)`

### Properties
- `protocol: string`
- `domain: string`
- `path: string`
- `query: Record<string, string>`

### Methods

- `setProtocol(protocol: string): UrlMage`
- `setDomain(domain: string): UrlMage`
- `setPath(path: string): UrlMage`
- `setQuery(key: string, value: QueryValue): UrlMage`
- `addPathSegment(segment: string): UrlMage`
- `removeLastPathSegment(): UrlMage`
- `setQueryObject(queryObject: Record<string, QueryValue>): UrlMage`
- `appendQuery(key: string, value: QueryValue): UrlMage`
- `getQueryArray(key: string): string[]`
- `toggleQueryParam(key: string, value: string): UrlMage`
- `normalizeProtocol(): UrlMage`
- `normalizeDomain(): UrlMage`
- `removeTrailingSlash(): UrlMage`
- `getSegments(): string[]`
- `isSubdomainOf(domain: string): boolean`
- `swapProtocol(newProtocol: string): UrlMage`
- `removeQuery(key: string): UrlMage`
- `encode(): string`
- `decode(): string`
- `toString(): string`
- `clone(): UrlMage`
- `getOrigin(): string`
- `hasQueryParam(key: string): boolean`
- `getPort(): string`
- `setPort(port: number): UrlMage`
- `removePort(): UrlMage`
- `getHash(): string`
- `setHash(hash: string): UrlMage`
- `removeHash(): UrlMage`
- `isAbsolute(): boolean`
- `isRelative(): boolean`

### Static Methods

- `UrlMage.isValid(url: string): boolean`
- `UrlMage.combine(...parts: string[]): string`
- `UrlMage.fromObject(urlObject: UrlObject): UrlMage`
- `UrlMage.parseQuery(queryString: string): Record<string, string | string[]>`