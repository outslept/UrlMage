type QueryValue = string | number | boolean | null | undefined

export class UrlMage {
  private url: URL

  constructor(url: string) {
    try {
      this.url = new URL(url)
    } catch (error) {
      throw new Error('Invalid URL provided')
    }
  }

  /**
   * Gets the current URL as a string.
   */
  toString(): string {
    return this.url.toString()
  }

  /**
   * Sets the protocol of the URL.
   * @param {string} protocol - The new protocol (e.g., "https:").
   */
  setProtocol(protocol: string): UrlMage {
    this.url.protocol = protocol
    return this
  }

  /**
   * Sets the hostname of the URL.
   * @param {string} hostname - The new hostname.
   */
  setHostname(hostname: string): UrlMage {
    this.url.hostname = hostname
    return this
  }

  /**
   * Sets the pathname of the URL.
   * @param {string} path - The new pathname.
   */
  setPath(path: string): UrlMage {
    this.url.pathname = path
    return this
  }

  /**
   * Adds a query parameter to the URL.
   * @param {string} key - The key of the query parameter.
   * @param {QueryValue} value - The value of the query parameter.
   */
  addQueryParam(key: string, value: QueryValue): UrlMage {
    this.url.searchParams.append(key, String(value))
    return this
  }

  /**
   * Removes a query parameter from the URL.
   * @param {string} key - The key of the query parameter to remove.
   */
  removeQueryParam(key: string): UrlMage {
    this.url.searchParams.delete(key)
    return this
  }

  /**
   * Sets the hash of the URL.
   * @param {string} hash - The new hash (without the # symbol).
   */
  setHash(hash: string): UrlMage {
    this.url.hash = hash
    return this
  }

  /**
   * Removes the hash from the URL.
   */
  removeHash(): UrlMage {
    this.url.hash = ''
    return this
  }

  /**
   * Ensures the URL has a trailing slash in its pathname.
   */
  ensureTrailingSlash(): UrlMage {
    if (!this.url.pathname.endsWith('/')) {
      this.url.pathname += '/'
    }
    return this
  }

  /**
   * Removes the trailing slash from the URL's pathname if it exists.
   */
  removeTrailingSlash(): UrlMage {
    this.url.pathname = this.url.pathname.replace(/\/$/, '')
    return this
  }

  /**
   * Gets the value of a specific query parameter.
   * @param {string} key - The key of the query parameter.
   * @returns {string | null} The value of the query parameter or null if not found.
   */
  getQueryParam(key: string): string | null {
    return this.url.searchParams.get(key)
  }

  /**
   * Checks if the URL is secure (uses HTTPS).
   * @returns {boolean} True if the URL uses HTTPS, false otherwise.
   */
  isSecure(): boolean {
    return this.url.protocol === 'https:'
  }

  /**
   * Converts the URL to a secure version (HTTPS).
   */
  toSecure(): UrlMage {
    if (!this.isSecure()) {
      this.url.protocol = 'https:'
    }
    return this
  }

  /**
   * Gets the origin of the URL.
   * @returns {string} The origin of the URL.
   */
  getOrigin(): string {
    return this.url.origin
  }

  /**
   * Gets the pathname segments as an array.
   * @returns {string[]} An array of pathname segments.
   */
  getPathSegments(): string[] {
    return this.url.pathname.split('/').filter((segment) => segment !== '')
  }

  /**
   * Replaces a specific path segment.
   * @param {number} index - The index of the segment to replace.
   * @param {string} newSegment - The new segment value.
   */
  replacePathSegment(index: number, newSegment: string): UrlMage {
    const segments = this.getPathSegments()
    if (index >= 0 && index < segments.length) {
      segments[index] = newSegment
      this.url.pathname = '/' + segments.join('/')
    }
    return this
  }

  /**
   * Removes the last path segment.
   */
  removeLastPathSegment(): UrlMage {
    const segments = this.getPathSegments()
    segments.pop()
    this.url.pathname = '/' + segments.join('/')
    return this
  }

  /**
   * Sets the port of the URL.
   * @param {number} port - The new port number.
   */
  setPort(port: number): UrlMage {
    this.url.port = port.toString()
    return this
  }

  /**
   * Removes the port from the URL.
   */
  removePort(): UrlMage {
    this.url.port = ''
    return this
  }

  /**
   * Checks if the URL has a specific query parameter.
   * @param {string} key - The key of the query parameter.
   * @returns {boolean} True if the query parameter exists, false otherwise.
   */
  hasQueryParam(key: string): boolean {
    return this.url.searchParams.has(key)
  }

  /**
   * Gets all query parameters as an object.
   * @returns {Record<string, string>} An object containing all query parameters.
   */
  getQueryParamsAsObject(): Record<string, string> {
    const params: Record<string, string> = {}
    this.url.searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }

  /**
   * Sets multiple query parameters at once.
   * @param {Record<string, QueryValue>} params - An object containing query parameters to set.
   */
  setQueryParams(params: Record<string, QueryValue>): UrlMage {
    Object.entries(params).forEach(([key, value]) => {
      this.url.searchParams.set(key, String(value))
    })
    return this
  }

  /**
   * Removes all query parameters.
   */
  clearQueryParams(): UrlMage {
    this.url.search = ''
    return this
  }

  /**
   * Checks if the URL is relative.
   * @returns {boolean} True if the URL is relative, false if it's absolute.
   */
  isRelative(): boolean {
    return !this.url.protocol && !this.url.host
  }

  /**
   * Gets the file extension of the URL path.
   * @returns {string | null} The file extension or null if not present.
   */
  getFileExtension(): string | null {
    const match = this.url.pathname.match(/\.([^./]+)$/)
    return match ? match[1] : null
  }

  /**
   * Changes the file extension of the URL path.
   * @param {string} newExtension - The new file extension.
   */
  changeFileExtension(newExtension: string): UrlMage {
    this.url.pathname = this.url.pathname.replace(
      /\.[^./]+$/,
      `.${newExtension}`,
    )
    return this
  }

  /**
   * Normalizes the URL by removing unnecessary components.
   */
  normalize(): UrlMage {
    this.url = new URL(this.url.href)
    return this
  }

  /**
   * Sorts the query parameters alphabetically.
   */
  sortQueryParams(): UrlMage {
    const sortedParams = new URLSearchParams(
      [...this.url.searchParams.entries()].sort(),
    )
    this.url.search = sortedParams.toString()
    return this
  }

  /**
   * Toggles a boolean query parameter.
   * @param {string} key - The key of the query parameter to toggle.
   */
  toggleQueryParam(key: string): UrlMage {
    if (this.hasQueryParam(key)) {
      this.removeQueryParam(key)
    } else {
      this.addQueryParam(key, 'true')
    }
    return this
  }

  /**
   * Checks if the URL is a subdomain of a given domain.
   * @param {string} domain - The domain to check against.
   * @returns {boolean} True if the URL is a subdomain of the given domain, false otherwise.
   */
  isSubdomainOf(domain: string): boolean {
    return this.url.hostname.endsWith(`.${domain}`)
  }

  /**
   * Removes the subdomain from the URL if present.
   */
  removeSubdomain(): UrlMage {
    const hostParts = this.url.hostname.split('.')
    if (hostParts.length > 2) {
      this.url.hostname = hostParts.slice(-2).join('.')
    }
    return this
  }

  /**
   * Prepends a path to the current pathname.
   * @param {string} path - The path to prepend.
   */
  prependPath(path: string): UrlMage {
    this.url.pathname = `/${path.replace(/^\//, '')}${this.url.pathname}`
    return this
  }

  /**
   * Appends a path to the current pathname.
   * @param {string} path - The path to append.
   */
  appendPath(path: string): UrlMage {
    this.url.pathname = `${this.url.pathname}/${path.replace(/^\//, '')}`
    return this
  }

  /**
   * Gets the parent directory of the current path.
   * @returns {string} The parent directory path.
   */
  getParentDirectory(): string {
    return this.url.pathname.split('/').slice(0, -1).join('/') || '/'
  }

  /**
   * Checks if the URL is using a standard port (80 for HTTP, 443 for HTTPS).
   * @returns {boolean} True if using a standard port, false otherwise.
   */
  isUsingStandardPort(): boolean {
    return (
      (this.url.protocol === 'http:' && this.url.port === '80') ||
      (this.url.protocol === 'https:' && this.url.port === '443') ||
      this.url.port === ''
    )
  }

  /**
   * Removes the username and password from the URL if present.
   */
  removeCredentials(): UrlMage {
    this.url.username = ''
    this.url.password = ''
    return this
  }

  /**
   * Sets the username and password for the URL.
   * @param {string} username - The username to set.
   * @param {string} password - The password to set.
   */
  setCredentials(username: string, password: string): UrlMage {
    this.url.username = encodeURIComponent(username)
    this.url.password = encodeURIComponent(password)
    return this
  }

  /**
   * Gets the username from the URL if present.
   * @returns {string} The decoded username or an empty string if not present.
   */
  getUsername(): string {
    return decodeURIComponent(this.url.username)
  }

  /**
   * Gets the password from the URL if present.
   * @returns {string} The decoded password or an empty string if not present.
   */
  getPassword(): string {
    return decodeURIComponent(this.url.password)
  }

  /**
   * Checks if the URL is a valid IPv4 address.
   * @returns {boolean} True if the hostname is a valid IPv4 address, false otherwise.
   */
  isIPv4(): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    return ipv4Regex.test(this.url.hostname)
  }

  /**
   * Checks if the URL is a valid IPv6 address.
   * @returns {boolean} True if the hostname is a valid IPv6 address, false otherwise.
   */
  isIPv6(): boolean {
    const ipv6Regex = /^(\[)?([0-9a-fA-F:]+)(\])?$/
    return ipv6Regex.test(this.url.hostname)
  }

  /**
   * Converts the URL to a data URL if possible.
   * @param {string} mimeType - The MIME type of the data.
   * @param {string} data - The data to encode.
   */
  toDataURL(mimeType: string, data: string): UrlMage {
    this.url = new URL(`data:${mimeType},${encodeURIComponent(data)}`)
    return this
  }

  /**
   * Checks if the URL is a data URL.
   * @returns {boolean} True if the URL is a data URL, false otherwise.
   */
  isDataURL(): boolean {
    return this.url.protocol === 'data:'
  }

  /**
   * Gets the top-level domain (TLD) of the URL.
   * @returns {string} The top-level domain.
   */
  getTLD(): string {
    const hostParts = this.url.hostname.split('.')
    return hostParts[hostParts.length - 1]
  }

  /**
   * Checks if two URLs are on the same domain.
   * @param {string} otherUrl - The URL to compare with.
   * @returns {boolean} True if the URLs are on the same domain, false otherwise.
   */
  isSameDomain(otherUrl: string): boolean {
    const other = new URL(otherUrl)
    return this.url.hostname === other.hostname
  }

  /**
   * Adds 'www.' subdomain if not present.
   */
  addWWW(): UrlMage {
    if (!this.url.hostname.startsWith('www.')) {
      this.url.hostname = `www.${this.url.hostname}`
    }
    return this
  }

  /**
   * Removes 'www.' subdomain if present.
   */
  removeWWW(): UrlMage {
    this.url.hostname = this.url.hostname.replace(/^www\./i, '')
    return this
  }

  /**
   * Converts the URL to a mailto link.
   * @param {string} email - The email address for the mailto link.
   */
  toMailto(email: string): UrlMage {
    this.url = new URL(`mailto:${email}`)
    return this
  }

  /**
   * Checks if the URL is a mailto link.
   * @returns {boolean} True if the URL is a mailto link, false otherwise.
   */
  isMailto(): boolean {
    return this.url.protocol === 'mailto:'
  }

  /**
   * Removes a specific query parameter if its value is empty.
   * @param {string} key - The key of the query parameter to check and potentially remove.
   */
  removeQueryParamIfEmpty(key: string): UrlMage {
    const value = this.url.searchParams.get(key)
    if (value === '' || value === null) {
      this.url.searchParams.delete(key)
    }
    return this
  }

  /**
   * Encodes the entire URL.
   */
  encodeURL(): UrlMage {
    this.url = new URL(encodeURI(this.url.href))
    return this
  }

  /**
   * Decodes the entire URL.
   */
  decodeURL(): UrlMage {
    this.url = new URL(decodeURI(this.url.href))
    return this
  }

  /**
   * Gets the file name from the URL path.
   * @returns {string | null} The file name or null if not present.
   */
  getFileName(): string | null {
    const pathSegments = this.getPathSegments()
    return pathSegments.length > 0
      ? pathSegments[pathSegments.length - 1]
      : null
  }

  /**
   * Checks if the URL is a valid URL.
   * @returns {boolean} True if the URL is valid, false otherwise.
   */
  isValid(): boolean {
    try {
      new URL(this.url.href)
      return true
    } catch {
      return false
    }
  }

  /**
   * Converts the URL to a relative URL.
   * @param {string} base - The base URL to make this URL relative to.
   */
  makeRelative(base: string): UrlMage {
    const baseUrl = new URL(base)
    if (this.url.origin === baseUrl.origin) {
      this.url = new URL(
        this.url.pathname + this.url.search + this.url.hash,
        baseUrl,
      )
    }
    return this
  }

  /**
   * Converts a relative URL to an absolute URL.
   * @param {string} base - The base URL to resolve against.
   */
  makeAbsolute(base: string): UrlMage {
    this.url = new URL(this.url.href, base)
    return this
  }

  /**
   * Reverses the domain name (e.g., "www.example.com" becomes "com.example.www").
   */
  reverseDomain(): UrlMage {
    const parts = this.url.hostname.split('.')
    this.url.hostname = parts.reverse().join('.')
    return this
  }

  /**
   * Checks if the URL uses a secure protocol (https, wss, ftps).
   * @returns {boolean} True if the URL uses a secure protocol, false otherwise.
   */
  isSecureProtocol(): boolean {
    return ['https:', 'wss:', 'ftps:'].includes(this.url.protocol)
  }

  /**
   * Converts the URL to use a secure protocol if available.
   */
  toSecureProtocol(): UrlMage {
    const secureProtocols: Record<string, string> = {
      'http:': 'https:',
      'ws:': 'wss:',
      'ftp:': 'ftps:',
    }
    if (secureProtocols[this.url.protocol]) {
      this.url.protocol = secureProtocols[this.url.protocol]
    }
    return this
  }

  /**
   * Gets all subdomains as an array.
   * @returns {string[]} An array of subdomains.
   */
  getSubdomains(): string[] {
    const parts = this.url.hostname.split('.')
    return parts.slice(0, -2)
  }

  /**
   * Renames a query parameter.
   * @param {string} oldKey - The current key of the query parameter.
   * @param {string} newKey - The new key for the query parameter.
   */
  renameQueryParam(oldKey: string, newKey: string): UrlMage {
    const value = this.url.searchParams.get(oldKey)
    if (value !== null) {
      this.url.searchParams.delete(oldKey)
      this.url.searchParams.set(newKey, value)
    }
    return this
  }

  /**
   * Checks if the URL is a local file URL.
   * @returns {boolean} True if the URL is a local file URL, false otherwise.
   */
  isLocalFileURL(): boolean {
    return this.url.protocol === 'file:'
  }

  /**
   * Converts the URL to a local file URL.
   * @param {string} path - The local file path.
   */
  toLocalFileURL(path: string): UrlMage {
    this.url = new URL(`file://${path}`)
    return this
  }

  /**
   * Gets the query string without the leading '?'.
   * @returns {string} The query string.
   */
  getQueryString(): string {
    return this.url.search.slice(1)
  }

  /**
   * Sets the entire query string.
   * @param {string} queryString - The new query string (without the leading '?').
   */
  setQueryString(queryString: string): UrlMage {
    this.url.search = queryString ? `?${queryString}` : ''
    return this
  }

  /**
   * Checks if the URL is an IP address (either IPv4 or IPv6).
   * @returns {boolean} True if the URL is an IP address, false otherwise.
   */
  isIPAddress(): boolean {
    return this.isIPv4() || this.isIPv6()
  }

  /**
   * Checks if the URL is an absolute URL.
   * @returns {boolean} True if the URL is absolute, false otherwise.
   */
  isAbsolute(): boolean {
    return !this.isRelative()
  }

  /**
   * Normalizes the path by resolving '..' and '.' segments.
   */
  normalizePath(): UrlMage {
    const segments = this.getPathSegments()
    const normalizedSegments: string[] = []
    for (const segment of segments) {
      if (segment === '..') {
        normalizedSegments.pop()
      } else if (segment !== '.') {
        normalizedSegments.push(segment)
      }
    }
    this.url.pathname = '/' + normalizedSegments.join('/')
    return this
  }

  /**
   * Checks if the URL contains a specific path segment.
   * @param {string} segment - The path segment to check for.
   * @returns {boolean} True if the segment is present in the path, false otherwise.
   */
  containsPathSegment(segment: string): boolean {
    return this.getPathSegments().includes(segment)
  }

  /**
   * Gets the number of path segments.
   * @returns {number} The number of path segments.
   */
  getPathSegmentCount(): number {
    return this.getPathSegments().length
  }

  /**
   * Truncates the path to a specific number of segments.
   * @param {number} count - The number of segments to keep.
   */
  truncatePath(count: number): UrlMage {
    const segments = this.getPathSegments()
    this.url.pathname = '/' + segments.slice(0, count).join('/')
    return this
  }

  /**
   * Checks if the URL is a base URL (no path, query, or hash).
   * @returns {boolean} True if the URL is a base URL, false otherwise.
   */
  isBaseURL(): boolean {
    return this.url.pathname === '/' && !this.url.search && !this.url.hash
  }

  /**
   * Strips the URL to its base (removes path, query, and hash).
   */
  stripToBase(): UrlMage {
    this.url.pathname = '/'
    this.url.search = ''
    this.url.hash = ''
    return this
  }

  /**
   * Checks if the URL uses HTTPS.
   * @returns {boolean} True if the URL uses HTTPS, false otherwise.
   */
  isHTTPS(): boolean {
    return this.url.protocol === 'https:'
  }

  /**
   * Converts the URL to use HTTPS.
   */
  toHTTPS(): UrlMage {
    if (this.url.protocol === 'http:') {
      this.url.protocol = 'https:'
    }
    return this
  }

  /**
   * Gets the last path segment.
   * @returns {string | null} The last path segment or null if the path is empty.
   */
  getLastPathSegment(): string | null {
    const segments = this.getPathSegments()
    return segments.length > 0 ? segments[segments.length - 1] : null
  }

  /**
   * Checks if the URL has a specific TLD.
   * @param {string} tld - The TLD to check for.
   * @returns {boolean} True if the URL has the specified TLD, false otherwise.
   */
  hasTLD(tld: string): boolean {
    return this.getTLD().toLowerCase() === tld.toLowerCase()
  }

  /**
   * Removes the query string if it's empty.
   */
  removeEmptyQuery(): UrlMage {
    if (this.url.search === '?') {
      this.url.search = ''
    }
    return this
  }

  /**
   * Checks if the URL is a localhost URL.
   * @returns {boolean} True if the URL is a localhost URL, false otherwise.
   */
  isLocalhost(): boolean {
    return (
      this.url.hostname === 'localhost' || this.url.hostname === '127.0.0.1'
    )
  }

  /**
   * Replaces the domain with 'localhost'.
   */
  toLocalhost(): UrlMage {
    this.url.hostname = 'localhost'
    return this
  }

  /**
   * Gets all unique query parameter keys.
   * @returns {string[]} An array of unique query parameter keys.
   */
  getUniqueQueryKeys(): string[] {
    return Array.from(new Set(this.url.searchParams.keys()))
  }

  /**
   * Checks if the URL has any query parameters.
   * @returns {boolean} True if the URL has query parameters, false otherwise.
   */
  hasQueryParams(): boolean {
    return this.url.searchParams.toString() !== ''
  }

  /**
   * Removes all empty query parameters (those with empty string values).
   */
  removeEmptyQueryParams(): UrlMage {
    for (const [key, value] of this.url.searchParams.entries()) {
      if (value === '') {
        this.url.searchParams.delete(key)
      }
    }
    return this
  }

  /**
   * Checks if the URL is a valid email address (mailto: URL).
   * @returns {boolean} True if the URL is a valid mailto URL, false otherwise.
   */
  isValidEmailURL(): boolean {
    return (
      this.url.protocol === 'mailto:' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.url.pathname)
    )
  }

  /**
   * Extracts the email address from a mailto URL.
   * @returns {string | null} The email address or null if not a valid mailto URL.
   */
  getEmailFromMailto(): string | null {
    return this.isValidEmailURL() ? this.url.pathname : null
  }

  /**
   * Converts the URL to lowercase.
   */
  toLowerCase(): UrlMage {
    this.url = new URL(this.url.href.toLowerCase())
    return this
  }

  /**
   * Checks if the URL contains a specific string in any part.
   * @param {string} str - The string to search for.
   * @returns {boolean} True if the string is found, false otherwise.
   */
  contains(str: string): boolean {
    return this.url.href.includes(str)
  }

  /**
   * Replaces all occurrences of a string in the URL.
   * @param {string} search - The string to search for.
   * @param {string} replace - The string to replace with.
   */
  replaceAll(search: string, replace: string): UrlMage {
    this.url = new URL(this.url.href.replaceAll(search, replace))
    return this
  }

  /**
   * Gets the number of query parameters.
   * @returns {number} The number of query parameters.
   */
  getQueryParamCount(): number {
    return this.url.searchParams.size
  }

  /**
   * Checks if the URL has a specific path prefix.
   * @param {string} prefix - The path prefix to check for.
   * @returns {boolean} True if the URL path starts with the prefix, false otherwise.
   */
  hasPathPrefix(prefix: string): boolean {
    return this.url.pathname.startsWith(`/${prefix.replace(/^\//, '')}`)
  }

  /**
   * Removes a specific path prefix if present.
   * @param {string} prefix - The path prefix to remove.
   */
  removePathPrefix(prefix: string): UrlMage {
    const cleanPrefix = prefix.replace(/^\//, '')
    if (this.hasPathPrefix(cleanPrefix)) {
      this.url.pathname = this.url.pathname.slice(cleanPrefix.length + 1) || '/'
    }
    return this
  }

  /**
   * Adds a path prefix.
   * @param {string} prefix - The path prefix to add.
   */
  addPathPrefix(prefix: string): UrlMage {
    const cleanPrefix = prefix.replace(/^\//, '').replace(/\/$/, '')
    this.url.pathname = `/${cleanPrefix}${this.url.pathname}`
    return this
  }

  /**
   * Checks if the URL is a valid URL for a specific protocol.
   * @param {string} protocol - The protocol to check for (e.g., 'http:', 'https:').
   * @returns {boolean} True if the URL is valid for the specified protocol, false otherwise.
   */
  isValidForProtocol(protocol: string): boolean {
    try {
      const url = new URL(this.url.href)
      return url.protocol === protocol
    } catch {
      return false
    }
  }

  /**
   * Converts the URL to a data URI (if it's an image URL).
   * @returns {Promise<string>} A promise that resolves to the data URI.
   */
  async toDataURI(): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('This method can only be used in a browser environment')
    }
    const response = await fetch(this.url.href)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Checks if the URL is an absolute URL.
   * @returns {boolean} True if the URL is absolute, false otherwise.
   */
  isAbsoluteURL(): boolean {
    return /^[a-z][a-z\d+\-.]*:/.test(this.url.href)
  }

  /**
   * Gets the URL without the hash fragment.
   * @returns {string} The URL without the hash fragment.
   */
  getURLWithoutHash(): string {
    return this.url.href.split('#')[0]
  }

  /**
   * Checks if the URL is a valid IPv6 address.
   * @returns {boolean} True if the URL is a valid IPv6 address, false otherwise.
   */
  isValidIPv6(): boolean {
    return /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(
      this.url.hostname,
    )
  }

  /**
   * Removes the default port for the current protocol.
   */
  removeDefaultPort(): UrlMage {
    if (
      (this.url.protocol === 'http:' && this.url.port === '80') ||
      (this.url.protocol === 'https:' && this.url.port === '443')
    ) {
      this.url.port = ''
    }
    return this
  }

  /**
   * Checks if the URL uses the default port for its protocol.
   * @returns {boolean} True if the URL uses the default port, false otherwise.
   */
  usesDefaultPort(): boolean {
    return (
      (this.url.protocol === 'http:' && this.url.port === '80') ||
      (this.url.protocol === 'https:' && this.url.port === '443') ||
      this.url.port === ''
    )
  }

  /**
   * Gets the base domain (eTLD+1) of the URL.
   * @returns {string} The base domain of the URL.
   */
  getBaseDomain(): string {
    const parts = this.url.hostname.split('.')
    if (parts.length > 2) {
      return parts.slice(-2).join('.')
    }
    return this.url.hostname
  }

  /**
   * Checks if the URL is a subdomain.
   * @returns {boolean} True if the URL is a subdomain, false otherwise.
   */
  isSubdomain(): boolean {
    return this.url.hostname.split('.').length > 2
  }

  /**
   * Converts the URL to a punycode representation for Internationalized Domain Names (IDN).
   */
  toPunycode(): UrlMage {
    this.url.hostname = this.url.hostname
      .split('.')
      .map((part) => {
        try {
          return new URL(`http://${part}`).hostname
        } catch {
          return part
        }
      })
      .join('.')
    return this
  }

  /**
   * Checks if the URL contains user information (username and/or password).
   * @returns {boolean} True if the URL contains user information, false otherwise.
   */
  hasUserInfo(): boolean {
    return this.url.username !== '' || this.url.password !== ''
  }

  /**
   * Removes the user information from the URL.
   */
  removeUserInfo(): UrlMage {
    this.url.username = ''
    this.url.password = ''
    return this
  }

  /**
   * Gets the URL as a normalized string (lowercase, sorted query parameters).
   * @returns {string} The normalized URL string.
   */
  getNormalizedString(): string {
    const url = new URL(this.url.href.toLowerCase())
    url.searchParams.sort()
    return url.href
  }

  /**
   * Checks if two URLs are equivalent (ignoring case and query parameter order).
   * @param {string} otherUrl - The URL to compare with.
   * @returns {boolean} True if the URLs are equivalent, false otherwise.
   */
  isEquivalentTo(otherUrl: string): boolean {
    const other = new UrlMage(otherUrl)
    return this.getNormalizedString() === other.getNormalizedString()
  }

  /**
   * Adds a timestamp query parameter to the URL.
   * @param {string} [paramName='t'] - The name of the timestamp parameter.
   */
  addTimestamp(paramName: string = 't'): UrlMage {
    this.url.searchParams.set(paramName, Date.now().toString())
    return this
  }

  /**
   * Checks if the URL is a valid URL for social media sharing.
   * @returns {boolean} True if the URL is valid for social media sharing, false otherwise.
   */
  isValidForSocialSharing(): boolean {
    return (
      this.isAbsoluteURL() &&
      (this.url.protocol === 'http:' || this.url.protocol === 'https:')
    )
  }

  /**
   * Converts the URL to a short URL using a hypothetical URL shortening service.
   * @returns {Promise<string>} A promise that resolves to the shortened URL.
   */
  async toShortUrl(): Promise<string> {
    // This is a placeholder implementation. In a real-world scenario,
    // you would integrate with an actual URL shortening service API.
    const response = await fetch('https://api.shorturl.com/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: this.url.href }),
    })
    const data = await response.json()
    return data.shortUrl
  }

  /**
   * Checks if the URL is likely to be a homepage.
   * @returns {boolean} True if the URL is likely a homepage, false otherwise.
   */
  isLikelyHomepage(): boolean {
    return this.url.pathname === '/' && !this.url.search && !this.url.hash
  }

  /**
   * Gets the URL without URL parameters and fragments.
   * @returns {string} The clean URL.
   */
  getCleanUrl(): string {
    return `${this.url.protocol}//${this.url.host}${this.url.pathname}`
  }

  /**
   * Checks if the URL is using HSTS (HTTP Strict Transport Security).
   * @returns {Promise<boolean>} A promise that resolves to true if HSTS is used, false otherwise.
   */
  async isUsingHSTS(): Promise<boolean> {
    if (typeof window === 'undefined') {
      throw new Error('This method can only be used in a browser environment')
    }
    const response = await fetch(this.url.href, { method: 'HEAD' })
    return response.headers.has('Strict-Transport-Security')
  }

  /**
   * Extracts all email addresses from the URL's query parameters.
   * @returns {string[]} An array of email addresses found in the query parameters.
   */
  extractEmailsFromQuery(): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails: string[] = []
    for (const [, value] of this.url.searchParams) {
      const matches = value.match(emailRegex)
      if (matches) {
        emails.push(...matches)
      }
    }
    return emails
  }

  /**
   * Checks if the URL is potentially malicious (e.g., contains suspicious keywords).
   * @returns {boolean} True if the URL is potentially malicious, false otherwise.
   */
  isPotentiallyMalicious(): boolean {
    const suspiciousKeywords = ['phishing', 'malware', 'virus', 'hack', 'scam']
    return suspiciousKeywords.some((keyword) =>
      this.url.href.toLowerCase().includes(keyword),
    )
  }

  /**
   * Gets the URL's favicon URL.
   * @returns {string} The URL of the favicon.
   */
  getFaviconUrl(): string {
    return `${this.url.protocol}//${this.url.host}/favicon.ico`
  }

  /**
   * Checks if the URL is a valid WebSocket URL.
   * @returns {boolean} True if the URL is a valid WebSocket URL, false otherwise.
   */
  isValidWebSocketUrl(): boolean {
    return this.url.protocol === 'ws:' || this.url.protocol === 'wss:'
  }

  /**
   * Converts an HTTP(S) URL to its WebSocket equivalent.
   */
  toWebSocketUrl(): UrlMage {
    if (this.url.protocol === 'http:') {
      this.url.protocol = 'ws:'
    } else if (this.url.protocol === 'https:') {
      this.url.protocol = 'wss:'
    }
    return this
  }

  /**
   * Checks if the URL is a valid FTP URL.
   * @returns {boolean} True if the URL is a valid FTP URL, false otherwise.
   */
  isValidFtpUrl(): boolean {
    return this.url.protocol === 'ftp:'
  }

  /**
   * Converts the URL to its canonical form.
   */
  toCanonical(): UrlMage {
    this.removeDefaultPort()
    this.removeTrailingSlash()
    this.toLowerCase()
    this.sortQueryParams()
    return this
  }

  /**
   * Checks if the URL is potentially an API endpoint.
   * @returns {boolean} True if the URL is likely an API endpoint, false otherwise.
   */
  isLikelyApiEndpoint(): boolean {
    const apiKeywords = ['api', 'service', 'endpoint', 'rest', 'graphql']
    return apiKeywords.some((keyword) =>
      this.url.pathname.toLowerCase().includes(keyword),
    )
  }

  /**
   * Extracts all hashtags from the URL's fragment identifier.
   * @returns {string[]} An array of hashtags found in the fragment.
   */
  extractHashtags(): string[] {
    const hashtagRegex = /#[\w-]+/g
    const matches = this.url.hash.match(hashtagRegex)
    return matches ? matches.map((tag) => tag.slice(1)) : []
  }

  /**
   * Checks if the URL is a valid git URL.
   * @returns {boolean} True if the URL is a valid git URL, false otherwise.
   */
  isValidGitUrl(): boolean {
    return /^(git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/.test(
      this.url.href,
    )
  }

  /**
   * Converts a git URL to its HTTPS equivalent.
   */
  gitUrlToHttps(): UrlMage {
    if (this.isValidGitUrl()) {
      const match = this.url.href.match(
        /^(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/,
      )
      if (match) {
        this.url = new URL(`https://${match[2].replace(':', '/')}`)
      }
    }
    return this
  }

  /**
   * Checks if the URL is a valid magnet link.
   * @returns {boolean} True if the URL is a valid magnet link, false otherwise.
   */
  isValidMagnetLink(): boolean {
    return this.url.protocol === 'magnet:'
  }

  /**
   * Extracts the torrent info hash from a magnet link.
   * @returns {string | null} The info hash if found, null otherwise.
   */
  extractMagnetInfoHash(): string | null {
    if (this.isValidMagnetLink()) {
      const match = this.url.href.match(/xt=urn:btih:([a-zA-Z0-9]+)/)
      return match ? match[1] : null
    }
    return null
  }

  /**
   * Checks if the URL is a valid data URL.
   * @returns {boolean} True if the URL is a valid data URL, false otherwise.
   */
  isValidDataUrl(): boolean {
    return this.url.protocol === 'data:'
  }

  /**
   * Extracts the MIME type from a data URL.
   * @returns {string | null} The MIME type if found, null otherwise.
   */
  extractDataUrlMimeType(): string | null {
    if (this.isValidDataUrl()) {
      const match = this.url.href.match(
        /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9]+);base64,/,
      )
      return match ? match[1] : null
    }
    return null
  }

  /**
   * Checks if the URL is a valid tel: URL.
   * @returns {boolean} True if the URL is a valid tel: URL, false otherwise.
   */
  isValidTelUrl(): boolean {
    return this.url.protocol === 'tel:'
  }

  /**
   * Extracts the phone number from a tel: URL.
   * @returns {string | null} The phone number if found, null otherwise.
   */
  extractPhoneNumber(): string | null {
    if (this.isValidTelUrl()) {
      return this.url.href.slice(4) // Remove 'tel:'
    }
    return null
  }

  /**
   * Checks if the URL is a valid sms: URL.
   * @returns {boolean} True if the URL is a valid sms: URL, false otherwise.
   */
  isValidSmsUrl(): boolean {
    return this.url.protocol === 'sms:'
  }

  /**
   * Extracts the phone number from an sms: URL.
   * @returns {string | null} The phone number if found, null otherwise.
   */
  extractSmsNumber(): string | null {
    if (this.isValidSmsUrl()) {
      return this.url.href.slice(4).split('?')[0] // Remove 'sms:' and any query parameters
    }
    return null
  }

  /**
   * Checks if the URL is a valid geo: URL.
   * @returns {boolean} True if the URL is a valid geo: URL, false otherwise.
   */
  isValidGeoUrl(): boolean {
    return this.url.protocol === 'geo:'
  }

  /**
   * Extracts latitude and longitude from a geo: URL.
   * @returns {[number, number] | null} An array with [latitude, longitude] if found, null otherwise.
   */
  extractGeoCoordinates(): [number, number] | null {
    if (this.isValidGeoUrl()) {
      const coords = this.url.href.slice(4).split(',') // Remove 'geo:'
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0])
        const lon = parseFloat(coords[1])
        if (!isNaN(lat) && !isNaN(lon)) {
          return [lat, lon]
        }
      }
    }
    return null
  }

  /**
   * Checks if the URL is a valid market: URL (for Android app store).
   * @returns {boolean} True if the URL is a valid market: URL, false otherwise.
   */
  isValidMarketUrl(): boolean {
    return this.url.protocol === 'market:'
  }

  /**
   * Extracts the package name from a market: URL.
   * @returns {string | null} The package name if found, null otherwise.
   */
  extractMarketPackageName(): string | null {
    if (this.isValidMarketUrl()) {
      const match = this.url.href.match(/id=([^&]+)/)
      return match ? match[1] : null
    }
    return null
  }

  /**
   * Converts a market: URL to its Google Play Store equivalent.
   */
  marketUrlToPlayStore(): UrlMage {
    if (this.isValidMarketUrl()) {
      const packageName = this.extractMarketPackageName()
      if (packageName) {
        this.url = new URL(
          `https://play.google.com/store/apps/details?id=${packageName}`,
        )
      }
    }
    return this
  }

  /**
   * Checks if the URL is a valid steam: URL.
   * @returns {boolean} True if the URL is a valid steam: URL, false otherwise.
   */
  isValidSteamUrl(): boolean {
    return this.url.protocol === 'steam:'
  }

  /**
   * Extracts the Steam app ID from a steam: URL.
   * @returns {string | null} The Steam app ID if found, null otherwise.
   */
  extractSteamAppId(): string | null {
    if (this.isValidSteamUrl()) {
      const match = this.url.href.match(/steam:\/\/rungameid\/(\d+)/)
      return match ? match[1] : null
    }
    return null
  }

  /**
   * Converts a steam: URL to its Steam store equivalent.
   */
  steamUrlToStore(): UrlMage {
    if (this.isValidSteamUrl()) {
      const appId = this.extractSteamAppId()
      if (appId) {
        this.url = new URL(`https://store.steampowered.com/app/${appId}`)
      }
    }
    return this
  }

  /**
   * Checks if the URL is a valid spotify: URL.
   * @returns {boolean} True if the URL is a valid spotify: URL, false otherwise.
   */
  isValidSpotifyUrl(): boolean {
    return this.url.protocol === 'spotify:'
  }

  /**
   * Extracts the Spotify ID and type from a spotify: URL.
   * @returns {[string, string] | null} An array with [type, id] if found, null otherwise.
   */
  extractSpotifyInfo(): [string, string] | null {
    if (this.isValidSpotifyUrl()) {
      const parts = this.url.href.slice(8).split(':') // Remove 'spotify:'
      if (parts.length >= 2) {
        return [parts[0], parts[1]]
      }
    }
    return null
  }

  /**
   * Converts a spotify: URL to its web equivalent.
   */
  spotifyUrlToWeb(): UrlMage {
    if (this.isValidSpotifyUrl()) {
      const info = this.extractSpotifyInfo()
      if (info) {
        const [type, id] = info
        this.url = new URL(`https://open.spotify.com/${type}/${id}`)
      }
    }
    return this
  }

  /**
   * Checks if the URL is a valid itms-apps: URL (for iOS App Store).
   * @returns {boolean} True if the URL is a valid itms-apps: URL, false otherwise.
   */
  isValidItmsAppsUrl(): boolean {
    return this.url.protocol === 'itms-apps:'
  }

  /**
   * Extracts the iOS app ID from an itms-apps: URL.
   * @returns {string | null} The iOS app ID if found, null otherwise.
   */
  extractIosAppId(): string | null {
    if (this.isValidItmsAppsUrl()) {
      const match = this.url.href.match(/id(\d+)/)
      return match ? match[1] : null
    }
    return null
  }

  /**
   * Converts an itms-apps: URL to its App Store equivalent.
   */
  itmsAppsUrlToAppStore(): UrlMage {
    if (this.isValidItmsAppsUrl()) {
      const match = this.url.href.match(
        /itms-apps:\/\/itunes\.apple\.com\/app\/id(\d+)/,
      )
      if (match) {
        this.url = new URL(`https://apps.apple.com/app/id${match[1]}`)
      }
    }
    return this
  }

  /**
   * Checks if the URL is a valid facetime: URL.
   * @returns {boolean} True if the URL is a valid facetime: URL, false otherwise.
   */
  isValidFacetimeUrl(): boolean {
    return (
      this.url.protocol === 'facetime:' ||
      this.url.protocol === 'facetime-audio:'
    )
  }

  /**
   * Extracts the FaceTime identifier (phone number or email) from a facetime: URL.
   * @returns {string | null} The FaceTime identifier if found, null otherwise.
   */
  extractFacetimeIdentifier(): string | null {
    if (this.isValidFacetimeUrl()) {
      return this.url.pathname || null
    }
    return null
  }
}
