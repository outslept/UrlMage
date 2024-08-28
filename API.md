# UrlMage API Documentation

## Table of Contents

1. [Constructor](#constructor)
2. [Basic URL Manipulation](#basic-url-manipulation)
3. [Query Parameters](#query-parameters)
4. [Path Manipulation](#path-manipulation)
5. [Protocol and Security](#protocol-and-security)
6. [Domain and Hostname](#domain-and-hostname)
7. [Special URL Types](#special-url-types)
8. [URL Conversion](#url-conversion)
9. [URL Validation](#url-validation)
10. [Information Extraction](#information-extraction)
11. [Utility Methods](#utility-methods)

## Constructor

### `new UrlMage(url: string)`

Creates a new UrlMage instance.

- `url`: The URL string to manipulate.

## Basic URL Manipulation

### `toString(): string`

Returns the current URL as a string.

### `setProtocol(protocol: string): UrlMage`

Sets the protocol of the URL.

### `setHostname(hostname: string): UrlMage`

Sets the hostname of the URL.

### `setPath(path: string): UrlMage`

Sets the pathname of the URL.

### `setHash(hash: string): UrlMage`

Sets the hash of the URL.

### `removeHash(): UrlMage`

Removes the hash from the URL.

## Query Parameters

### `addQueryParam(key: string, value: QueryValue): UrlMage`

Adds a query parameter to the URL.

### `removeQueryParam(key: string): UrlMage`

Removes a query parameter from the URL.

### `getQueryParam(key: string): string | null`

Gets the value of a specific query parameter.

### `hasQueryParam(key: string): boolean`

Checks if the URL has a specific query parameter.

### `getQueryParamsAsObject(): Record<string, string>`

Gets all query parameters as an object.

### `setQueryParams(params: Record<string, QueryValue>): UrlMage`

Sets multiple query parameters at once.

### `clearQueryParams(): UrlMage`

Removes all query parameters.

## Path Manipulation

### `ensureTrailingSlash(): UrlMage`

Ensures the URL has a trailing slash in its pathname.

### `removeTrailingSlash(): UrlMage`

Removes the trailing slash from the URL's pathname if it exists.

### `getPathSegments(): string[]`

Gets the pathname segments as an array.

### `replacePathSegment(index: number, newSegment: string): UrlMage`

Replaces a specific path segment.

### `removeLastPathSegment(): UrlMage`

Removes the last path segment.

## Protocol and Security

### `isSecure(): boolean`

Checks if the URL is secure (uses HTTPS).

### `toSecure(): UrlMage`

Converts the URL to a secure version (HTTPS).

### `isSecureProtocol(): boolean`

Checks if the URL uses a secure protocol (https, wss, ftps).

### `toSecureProtocol(): UrlMage`

Converts the URL to use a secure protocol if available.

## Domain and Hostname

### `getOrigin(): string`

Gets the origin of the URL.

### `isSubdomainOf(domain: string): boolean`

Checks if the URL is a subdomain of a given domain.

### `removeSubdomain(): UrlMage`

Removes the subdomain from the URL if present.

### `getBaseDomain(): string`

Gets the base domain (eTLD+1) of the URL.

### `isSubdomain(): boolean`

Checks if the URL is a subdomain.

## Special URL Types

### `isValidEmailURL(): boolean`

Checks if the URL is a valid email address (mailto: URL).

### `isValidDataUrl(): boolean`

Checks if the URL is a valid data URL.

### `isValidMagnetLink(): boolean`

Checks if the URL is a valid magnet link.

### `isValidGitUrl(): boolean`

Checks if the URL is a valid git URL.

### `isValidTelUrl(): boolean`

Checks if the URL is a valid tel: URL.

### `isValidSmsUrl(): boolean`

Checks if the URL is a valid sms: URL.

### `isValidGeoUrl(): boolean`

Checks if the URL is a valid geo: URL.

### `isValidMarketUrl(): boolean`

Checks if the URL is a valid market: URL (for Android app store).

### `isValidSteamUrl(): boolean`

Checks if the URL is a valid steam: URL.

### `isValidSpotifyUrl(): boolean`

Checks if the URL is a valid spotify: URL.

### `isValidItmsAppsUrl(): boolean`

Checks if the URL is a valid itms-apps: URL (for iOS App Store).

### `isValidFacetimeUrl(): boolean`

Checks if the URL is a valid facetime: URL.

## URL Conversion

### `toWebSocketUrl(): UrlMage`

Converts an HTTP(S) URL to its WebSocket equivalent.

### `gitUrlToHttps(): UrlMage`

Converts a git URL to its HTTPS equivalent.

### `marketUrlToPlayStore(): UrlMage`

Converts a market: URL to its Google Play Store equivalent.

### `steamUrlToStore(): UrlMage`

Converts a steam: URL to its Steam store equivalent.

### `spotifyUrlToWeb(): UrlMage`

Converts a spotify: URL to its web equivalent.

### `itmsAppsUrlToAppStore(): UrlMage`

Converts an itms-apps: URL to its App Store equivalent.

## URL Validation

### `isValid(): boolean`

Checks if the URL is a valid URL.

### `isValidForProtocol(protocol: string): boolean`

Checks if the URL is a valid URL for a specific protocol.

### `isValidWebSocketUrl(): boolean`

Checks if the URL is a valid WebSocket URL.

### `isValidFtpUrl(): boolean`

Checks if the URL is a valid FTP URL.

### `isValidForSocialSharing(): boolean`

Checks if the URL is a valid URL for social media sharing.

## Information Extraction

### `getEmailFromMailto(): string | null`

Extracts the email address from a mailto URL.

### `extractDataUrlMimeType(): string | null`

Extracts the MIME type from a data URL.

### `extractMagnetInfoHash(): string | null`

Extracts the torrent info hash from a magnet link.

### `extractPhoneNumber(): string | null`

Extracts the phone number from a tel: URL.

### `extractSmsNumber(): string | null`

Extracts the phone number from an sms: URL.

### `extractGeoCoordinates(): [number, number] | null`

Extracts latitude and longitude from a geo: URL.

### `extractMarketPackageName(): string | null`

Extracts the package name from a market: URL.

### `extractSteamAppId(): string | null`

Extracts the Steam app ID from a steam: URL.

### `extractSpotifyInfo(): [string, string] | null`

Extracts the Spotify ID and type from a spotify: URL.

### `extractIosAppId(): string | null`

Extracts the iOS app ID from an itms-apps: URL.

### `extractFacetimeIdentifier(): string | null`

Extracts the FaceTime identifier from a facetime: URL.

## Utility Methods

### `toLowerCase(): UrlMage`

Converts the URL to lowercase.

### `contains(str: string): boolean`

Checks if the URL contains a specific string in any part.

### `replaceAll(search: string, replace: string): UrlMage`

Replaces all occurrences of a string in the URL.

### `getQueryParamCount(): number`

Gets the number of query parameters.

### `hasPathPrefix(prefix: string): boolean`

Checks if the URL has a specific path prefix.

### `removePathPrefix(prefix: string): UrlMage`

Removes a specific path prefix if present.

### `addPathPrefix(prefix: string): UrlMage`

Adds a path prefix.

### `isLikelyHomepage(): boolean`

Checks if the URL is likely to be a homepage.

### `getCleanUrl(): string`

Gets the URL without URL parameters and fragments.

### `isPotentiallyMalicious(): boolean`

Checks if the URL is potentially malicious (e.g., contains suspicious keywords).

### `getFaviconUrl(): string`

Gets the URL's favicon URL.

### `toCanonical(): UrlMage`

Converts the URL to its canonical form.

### `isLikelyApiEndpoint(): boolean`

Checks if the URL is potentially an API endpoint.

### `extractHashtags(): string[]`

Extracts all hashtags from the URL's fragment identifier.

### `isAbsolute(): boolean`

Checks if the URL is an absolute URL.

### `isRelative(): boolean`

Checks if the URL is a relative URL.

### `normalizePath(): UrlMage`

Normalizes the path by resolving '..' and '.' segments.

### `containsPathSegment(segment: string): boolean`

Checks if the URL contains a specific path segment.

### `getPathSegmentCount(): number`

Gets the number of path segments.

### `truncatePath(count: number): UrlMage`

Truncates the path to a specific number of segments.

### `isBaseURL(): boolean`

Checks if the URL is a base URL (no path, query, or hash).

### `stripToBase(): UrlMage`

Strips the URL to its base (removes path, query, and hash).

### `isHTTPS(): boolean`

Checks if the URL uses HTTPS.

### `toHTTPS(): UrlMage`

Converts the URL to use HTTPS.

### `getLastPathSegment(): string | null`

Gets the last path segment.

### `hasTLD(tld: string): boolean`

Checks if the URL has a specific TLD.

### `removeEmptyQuery(): UrlMage`

Removes the query string if it's empty.

### `isLocalhost(): boolean`

Checks if the URL is a localhost URL.

### `toLocalhost(): UrlMage`

Replaces the domain with 'localhost'.

### `getUniqueQueryKeys(): string[]`

Gets all unique query parameter keys.

### `hasQueryParams(): boolean`

Checks if the URL has any query parameters.

### `getURLWithoutHash(): string`

Gets the URL without the hash fragment.

### `isValidIPv6(): boolean`

Checks if the URL is a valid IPv6 address.

### `removeDefaultPort(): UrlMage`

Removes the default port for the current protocol.

### `usesDefaultPort(): boolean`

Checks if the URL uses the default port for its protocol.

### `toPunycode(): UrlMage`

Converts the URL to a punycode representation for Internationalized Domain Names (IDN).

### `hasUserInfo(): boolean`

Checks if the URL contains user information (username and/or password).

### `removeUserInfo(): UrlMage`

Removes the user information from the URL.

### `getNormalizedString(): string`

Gets the URL as a normalized string (lowercase, sorted query parameters).

### `isEquivalentTo(otherUrl: string): boolean`

Checks if two URLs are equivalent (ignoring case and query parameter order).

### `addTimestamp(paramName: string = 't'): UrlMage`

Adds a timestamp query parameter to the URL.

### `async toShortUrl(): Promise<string>`

Converts the URL to a short URL using a hypothetical URL shortening service.

### `async isUsingHSTS(): Promise<boolean>`

Checks if the URL is using HSTS (HTTP Strict Transport Security).

### `async toDataURI(): Promise<string>`

Converts the URL to a data URI (if it's an image URL).

## Type Definitions

### `QueryValue`

```typescript
type QueryValue = string | number | boolean | null | undefined
```