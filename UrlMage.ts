type QueryValue = string | number | boolean | null | undefined;

export class UrlMage {
  private url: URL;

  /**
   * Creates a new UrlMage instance.
   * @param {string} url - The URL to parse.
   * @throws {Error} - If the provided URL is invalid.
   */
  constructor(url: string) {
    try {
      this.url = new URL(url);
    } catch (error) {
      throw new Error("Invalid URL provided");
    }
  }

  // Basic getters
  get protocol(): string {
    return this.url.protocol.slice(0, -1);
  }

  get domain(): string {
    return this.url.hostname;
  }

  get path(): string {
    return this.url.pathname;
  }

  get query(): Record<string, string> {
    return Object.fromEntries(this.url.searchParams);
  }

  // Basic setters
  setProtocol(protocol: string): this {
    this.url.protocol = protocol;
    return this;
  }

  setDomain(domain: string): this {
    this.url.hostname = domain;
    return this;
  }

  setPath(path: string): this {
    this.url.pathname = path;
    return this;
  }

  setQuery(key: string, value: QueryValue): this {
    if (value != null) {
      this.url.searchParams.set(key, value.toString());
    }
    return this;
  }

  /**
   * Adds a segment to the end of the path.
   * @param {string} segment - The segment to add.
   * @returns {this} The current instance.
   */
  addPathSegment(segment: string): this {
    this.url.pathname = UrlMage.combine(this.path, segment);
    return this;
  }

  /**
   * Removes the last segment from the path.
   * @returns {this} The current instance.
   */
  removeLastPathSegment(): this {
    const segments = this.getSegments();
    segments.pop();
    this.url.pathname = `/${segments.join("/")}`;
    return this;
  }

  /**
   * Inserts a segment at the specified index in the path.
   * @param {number} index - The index at which to insert the segment.
   * @param {string} segment - The segment to insert.
   * @returns {this} The current instance.
   */
  insertPathSegment(index: number, segment: string): this {
    const segments = this.getSegments();
    segments.splice(index, 0, segment);
    this.url.pathname = `/${segments.join("/")}`;
    return this;
  }

  /**
   * Replaces a segment at the specified index in the path.
   * @param {number} index - The index of the segment to replace.
   * @param {string} newSegment - The new segment.
   * @returns {this} The current instance.
   */
  replacePathSegment(index: number, newSegment: string): this {
    const segments = this.getSegments();
    if (index >= 0 && index < segments.length) {
      segments[index] = newSegment;
      this.url.pathname = `/${segments.join("/")}`;
    }
    return this;
  }

  /**
   * Prepends a path to the current path.
   * @param {string} path - The path to prepend.
   * @returns {this} The current instance.
   */
  prependPath(path: string): this {
    this.url.pathname = UrlMage.combine(path, this.url.pathname);
    return this;
  }

  /**
   * Appends a path to the current path.
   * @param {string} path - The path to append.
   * @returns {this} The current instance.
   */
  appendPath(path: string): this {
    this.url.pathname = UrlMage.combine(this.url.pathname, path);
    return this;
  }

  /**
   * Ensures the path ends with a trailing slash.
   * @returns {this} The current instance.
   */
  ensureTrailingSlash(): UrlMage {
    if (!this.path.endsWith("/")) {
      this.url.pathname += "/";
    }
    return this;
  }

  /**
   * Removes the trailing slash from the path if it exists.
   * @returns {this} The current instance.
   */
  removeTrailingSlash(): UrlMage {
    this.url.pathname = this.url.pathname.replace(/\/$/, "");
    return this;
  }

  /**
   * Gets the segments of the path.
   * @returns {string[]} An array of path segments.
   */
  getSegments(): string[] {
    return this.path.split("/").filter(Boolean);
  }

  /**
   * Gets the filename from the path.
   * @returns {string | null} The filename or null if not present.
   */
  getFileName(): string | null {
    const segments = this.getSegments();
    return segments.length > 0 ? segments[segments.length - 1] : null;
  }

  /**
   * Gets the file extension from the path.
   * @returns {string | null} The file extension or null if not present.
   */
  getFileExtension(): string | null {
    const fileName = this.getFileName();
    if (fileName) {
      const parts = fileName.split(".");
      return parts.length > 1 ? parts[parts.length - 1] : null;
    }
    return null;
  }

  /**
   * Changes the file extension in the path.
   * @param {string} newExtension - The new file extension.
   * @returns {this} The current instance.
   */
  changeFileExtension(newExtension: string): UrlMage {
    const segments = this.getSegments();
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      const parts = lastSegment.split(".");
      if (parts.length > 1) {
        parts[parts.length - 1] = newExtension;
        segments[segments.length - 1] = parts.join(".");
        this.url.pathname = "/" + segments.join("/");
      }
    }
    return this;
  }

  /**
   * Sets the query object on the URL.
   * @param {Record<string, QueryValue>} queryObject - The query object to set.
   * @returns {this} The current instance.
   */
  setQueryObject(queryObject: Record<string, QueryValue>): UrlMage {
    this.url.search = "";
    Object.entries(queryObject).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        this.url.searchParams.append(key, value.toString());
      }
    });
    return this;
  }

  /**
   * Appends a query parameter to the URL.
   * @param {string} key - The key of the query parameter.
   * @param {QueryValue} value - The value of the query parameter.
   * @returns {this} The current instance.
   */
  appendQuery(key: string, value: QueryValue): UrlMage {
    if (value !== null && value !== undefined) {
      this.url.searchParams.append(key, value.toString());
    }
    return this;
  }

  /**
   * Gets an array of query parameter values for a given key.
   * @param {string} key - The key of the query parameter.
   * @returns {string[]} An array of query parameter values.
   */
  getQueryArray(key: string): string[] {
    return this.url.searchParams.getAll(key);
  }

  /**
   * Toggles a query parameter value for a given key.
   * @param {string} key - The key of the query parameter.
   * @param {string} value - The value of the query parameter.
   * @returns {this} The current instance.
   */
  toggleQueryParam(key: string, value: string): UrlMage {
    const values = this.getQueryArray(key);
    if (values.includes(value)) {
      this.url.searchParams.delete(key, value);
    } else {
      this.url.searchParams.append(key, value);
    }
    return this;
  }

  /**
   * Toggles a query parameter value for a given key.
   * @param {string} key - The key of the query parameter.
   * @param {string} value - The value of the query parameter.
   * @returns {this} The current instance.
   */
  toggleQueryParamValue(key: string, value: string): UrlMage {
    const currentValue = this.url.searchParams.get(key);
    if (currentValue === value) {
      this.url.searchParams.delete(key);
    } else {
      this.url.searchParams.set(key, value);
    }
    return this;
  }

  /**
   * Removes all empty query parameters from the URL.
   * @returns {this} The current instance.
   */
  removeEmptyQueryParams(): UrlMage {
    [...this.url.searchParams.entries()].forEach(([key, value]) => {
      if (value === "") {
        this.url.searchParams.delete(key);
      }
    });
    return this;
  }

  /**
   * Gets the base URL (protocol and domain).
   * @returns {string} The base URL.
   */
  normalizeProtocol(): UrlMage {
    this.url.protocol = this.url.protocol.toLowerCase();
    return this;
  }

  /**
   * Converts the URL to a relative URL.
   * @param {string} base - The base URL.
   * @returns {this} The current instance.
   */
  makeRelative(base: string): UrlMage {
    const baseUrl = new URL(base);
    if (this.url.origin === baseUrl.origin) {
      this.url = new URL(
        this.url.pathname + this.url.search + this.url.hash,
        "http://dummy.com"
      );
    }
    return this;
  }

  /**
   * Converts the URL to an absolute URL.
   * @param {string} base - The base URL.
   * @returns {this} The current instance.
   */
  makeAbsolute(base: string): UrlMage {
    if (this.isRelative()) {
      this.url = new URL(this.toString(), base);
    }
    return this;
  }

  /**
   * Normalizes the domain of the URL.
   * @returns {this} The current instance.
   */
  normalizeDomain(): UrlMage {
    this.url.hostname = this.url.hostname.toLowerCase();
    return this;
  }

  /**
   * Removes the trailing slash from the path if it exists.
   * @returns {this} The current instance.
   */
  isSubdomainOf(domain: string): boolean {
    const normalizedDomain = domain.toLowerCase();
    return (
      this.domain.endsWith(`.${normalizedDomain}`) &&
      this.domain !== normalizedDomain
    );
  }

  /**
   * Swaps the protocol of the URL.
   * @param {string} newProtocol - The new protocol.
   * @returns {this} The current instance.
   */
  swapProtocol(newProtocol: string): UrlMage {
    this.url.protocol = newProtocol;
    return this;
  }

  /**
   * Removes a query parameter from the URL.
   * @param {string} key - The key of the query parameter.
   * @returns {this} The current instance.
   */
  removeQuery(key: string): UrlMage {
    this.url.searchParams.delete(key);
    return this;
  }

  /**
   * Encodes the URL.
   * @returns {string} The encoded URL.
   */
  encode(): string {
    return encodeURIComponent(this.toString());
  }

  /**
   * Decodes the URL.
   * @returns {string} The decoded URL.
   */
  decode(): string {
    return decodeURIComponent(this.toString());
  }

  /**
   * Returns the URL as a string.
   * @returns {string} The URL as a string.
   */
  toString(): string {
    return this.url.toString();
  }

  /**
   * Clones the URL.
   * @returns {UrlMage} A new UrlMage instance with the same URL.
   */
  clone(): UrlMage {
    return new UrlMage(this.toString());
  }

  /**
   * Gets the origin of the URL.
   * @returns {string} The origin.
   */
  getOrigin(): string {
    return this.url.origin;
  }

  /**
   * Checks if a query parameter exists in the URL.
   * @param {string} key - The key of the query parameter.
   * @returns {boolean} True if the query parameter exists, false otherwise.
   */
  hasQueryParam(key: string): boolean {
    return this.url.searchParams.has(key);
  }

  /**
   * Gets the port of the URL.
   * @returns {string} The port.
   */
  getPort(): string {
    return this.url.port;
  }

  /**
   * Sets the port of the URL.
   * @param {number} port - The port to set.
   * @returns {this} The current instance.
   */
  setPort(port: number): UrlMage {
    this.url.port = port.toString();
    return this;
  }

  /**
   * Removes the port from the URL.
   * @returns {this} The current instance.
   */
  removePort(): UrlMage {
    this.url.port = "";
    return this;
  }

  /**
   * Gets the hash of the URL.
   * @returns {string} The hash.
   */
  getHash(): string {
    return this.url.hash.slice(1);
  }

  /**
   * Sets the hash of the URL.
   * @param {string} hash - The hash to set.
   * @returns {this} The current instance.
   */
  setHash(hash: string): UrlMage {
    this.url.hash = hash;
    return this;
  }

  /**
   * Removes the hash from the URL.
   * @returns {this} The current instance.
   */
  removeHash(): UrlMage {
    this.url.hash = "";
    return this;
  }

  /**
   * Checks if the URL is absolute.
   * @returns {boolean} True if the URL is absolute, false otherwise.
   */
  isAbsolute(): boolean {
    return this.url.protocol !== "";
  }

  /**
   * Checks if the URL is relative.
   * @returns {boolean} True if the URL is relative, false otherwise.
   */
  isRelative(): boolean {
    return !this.isAbsolute();
  }

  /**
   * Gets the subdomain from the domain.
   * @returns {string | null} The subdomain or null if not present.
   */
  getSubdomain(): string | null {
    const parts = this.domain.split(".");
    return parts.length > 2 ? parts[0] : null;
  }

  /**
   * Sets the subdomain of the domain.
   * @param {string} subdomain - The subdomain to set.
   * @returns {this} The current instance.
   */
  setSubdomain(subdomain: string): UrlMage {
    const parts = this.domain.split(".");
    if (parts.length > 2) {
      parts[0] = subdomain;
    } else {
      parts.unshift(subdomain);
    }
    this.url.hostname = parts.join(".");
    return this;
  }

  /**
   * Removes the subdomain from the domain.
   * @returns {this} The current instance.
   */
  removeSubdomain(): UrlMage {
    const parts = this.domain.split(".");
    if (parts.length > 2) {
      parts.shift();
      this.url.hostname = parts.join(".");
    }
    return this;
  }

  /**
   * Removes a query parameter if its value is empty.
   * @param {string} key - The key of the query parameter.
   * @returns {this} The current instance.
   */
  removeQueryIfEmpty(key: string): UrlMage {
    const value = this.url.searchParams.get(key);
    if (value === "") {
      this.url.searchParams.delete(key);
    }
    return this;
  }

  /**
   * Renames a query parameter.
   * @param {string} oldKey - The old key of the query parameter.
   * @param {string} newKey - The new key of the query parameter.
   * @returns {this} The current instance.
   */
  renameQueryParam(oldKey: string, newKey: string): UrlMage {
    const value = this.url.searchParams.get(oldKey);
    if (value !== null) {
      this.url.searchParams.delete(oldKey);
      this.url.searchParams.set(newKey, value);
    }
    return this;
  }

  /**
   * Normalizes the URL.
   * @returns {this} The current instance.
   */
  normalize(): UrlMage {
    return this.normalizeProtocol()
      .normalizeDomain()
      .removeTrailingSlash()
      .sortQueryParams();
  }

  /**
   * Sorts the query parameters in alphabetical order.
   * @returns {this} The current instance.
   */
  sortQueryParams(): UrlMage {
    const sortedParams = new URLSearchParams(
      [...this.url.searchParams.entries()].sort()
    );
    this.url.search = sortedParams.toString();
    return this;
  }

  /**
   * Gets the fragment of the URL.
   * @returns {string} The fragment.
   */
  getFragment(): string {
    return this.url.hash.slice(1);
  }

  /**
   * Sets the fragment of the URL.
   * @param {string} fragment - The fragment to set.
   * @returns {this} The current instance.
   */
  setFragment(fragment: string): UrlMage {
    this.url.hash = fragment;
    return this;
  }

  /**
   * Removes the fragment from the URL.
   * @returns {this} The current instance.
   */
  removeFragment(): UrlMage {
    this.url.hash = "";
    return this;
  }

  /**
   * Checks if the URL is secure.
   * @returns {boolean} True if the URL is secure, false otherwise.
   */
  isSecure(): boolean {
    return this.protocol === "https";
  }

  /**
   * Converts the URL to a secure URL.
   * @returns {this} The current instance.
   */
  toSecure(): UrlMage {
    if (this.protocol === "http") {
      this.url.protocol = "https:";
    }
    return this;
  }

  /**
   * Converts the URL to an insecure URL.
   * @returns {this} The current instance.
   */
  toInsecure(): UrlMage {
    if (this.protocol === "https") {
      this.url.protocol = "http:";
    }
    return this;
  }

  /**
   * Merges query parameters into the URL.
   * @param {Record<string, QueryValue>} params - The query parameters to merge.
   * @returns {this} The current instance.
   */
  mergeQueryParams(params: Record<string, QueryValue>): UrlMage {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        this.url.searchParams.set(key, value.toString());
      }
    });
    return this;
  }

  /**
   * Gets an array of all query parameter keys.
   * @returns {string[]} An array of query parameter keys.
   */
  getQueryParamKeys(): string[] {
    return Array.from(this.url.searchParams.keys());
  }

  /**
   * Clears all query parameters from the URL.
   * @returns {this} The current instance.
   */
  clearQueryParams(): UrlMage {
    this.url.search = "";
    return this;
  }

  /**
   * Reverses the domain.
   * @returns {this} The current instance.
   */
  reverseDomain(): UrlMage {
    const parts = this.domain.split(".");
    this.url.hostname = parts.reverse().join(".");
    return this;
  }

  /**
   * Sets the top-level domain of the domain.
   * @param {string} tld - The top-level domain to set.
   * @returns {this} The current instance.
   */
  setTld(tld: string): UrlMage {
    const parts = this.domain.split(".");
    if (parts.length > 1) {
      parts[parts.length - 1] = tld;
      this.url.hostname = parts.join(".");
    }
    return this;
  }

  /**
   * Checks if the URL is localhost.
   * @returns {boolean} True if the URL is localhost, false otherwise.
   */
  isLocalhost(): boolean {
    return this.domain === "localhost" || this.domain === "127.0.0.1";
  }

  /**
   * Checks if the URL is the same domain as another URL.
   * @param {string | UrlMage} otherUrl - The other URL to compare.
   * @returns {boolean} True if the URLs are the same domain, false otherwise.
   */
  isSameDomain(otherUrl: string | UrlMage): boolean {
    const other =
      otherUrl instanceof UrlMage ? otherUrl : new UrlMage(otherUrl);
    return this.domain === other.domain;
  }

  /**
   * Checks if the URL has a standard port.
   * @returns {boolean} True if the URL has a standard port, false otherwise.
   */
  isStandardPort(): boolean {
    return (
      (this.protocol === "http" && this.url.port === "80") ||
      (this.protocol === "https" && this.url.port === "443") ||
      this.url.port === ""
    );
  }

  /**
   * Removes the standard port from the URL.
   * @returns {this} The current instance.
   */
  removeStandardPort(): UrlMage {
    if (this.isStandardPort()) {
      this.url.port = "";
    }
    return this;
  }

  /**
   * Returns a JSON representation of the URL.
   * @returns {object} A JSON representation of the URL
   */
  toJSON(): object {
    return {
      protocol: this.protocol,
      domain: this.domain,
      port: this.getPort(),
      path: this.path,
      query: this.query,
      hash: this.getHash(),
    };
  }

  /**
   * Checks if a given IP address is valid.
   * @param {string} ip - The IP address to check.
   * @returns {boolean} True if the IP address is valid, false otherwise.
   */
  static isValidIp(ip: string): boolean {
    const parts = ip.split(".");
    return (
      parts.length === 4 &&
      parts.every((part) => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255 && part === num.toString();
      })
    );
  }

  /**
   * Sanitizes a given path by removing invalid characters.
   * @param {string} path - The path to sanitize.
   * @returns {string} The sanitized path.
   */
  static sanitizePath(path: string): string {
    return path.replace(/[^a-zA-Z0-9-_/.]/g, "");
  }

  /**
   * Compares two URLs and returns true if they are the same.
   * @param {string | UrlMage} url1 - The first URL to compare.
   * @param {string | UrlMage} url2 - The second URL to compare.
   * @returns {boolean} True if the URLs are the same, false otherwise.
   */
  static compareUrls(url1: string | UrlMage, url2: string | UrlMage): boolean {
    const u1 = url1 instanceof UrlMage ? url1 : new UrlMage(url1);
    const u2 = url2 instanceof UrlMage ? url2 : new UrlMage(url2);
    return u1.toString() === u2.toString();
  }

  /**
   * Checks if the URL is relative to another URL.
   * @param {string | UrlMage} base - The base URL to compare.
   */
  isRelativeTo(base: string | UrlMage): boolean {
    const baseUrl = base instanceof UrlMage ? base : new UrlMage(base);
    return this.toString().startsWith(baseUrl.toString());
  }

  /**
   * Gets the base URL (protocol and domain).
   * @returns {string} The base URL.
   */
  getBaseUrl(): string {
    return `${this.protocol}://${this.domain}`;
  }

  /**
   * Removes leading and trailing slashes from the path and ensures all segments are valid.
   * @returns {UrlMage} The current UrlMage instance.
   */
  trimPath(): UrlMage {
    this.url.pathname = "/" + this.getSegments().filter(Boolean).join("/");
    return this;
  }

  /**
   * Checks if a given string is a valid protocol.
   * @param {string} protocol - The protocol to check.
   * @returns {boolean} True if the protocol is valid, false otherwise.
   */
  static isValidProtocol(protocol: string): boolean {
    return /^[a-z][a-z0-9+\-.]*$/.test(protocol);
  }

  /**
   * Joins multiple path segments into a single path.
   * @param {...string} paths - The path segments to join.
   * @returns {string} The joined path.
   */
  static joinPaths(...paths: string[]): string {
    return paths
      .map((path) => path.replace(/^\/|\/$/g, ""))
      .filter(Boolean)
      .join("/");
  }

  /**
   * Checks if a given string is a valid domain.
   * @param {string} domain - The domain to check.
   * @returns {boolean} True if the domain is valid, false otherwise.
   */
  static isValidDomain(domain: string): boolean {
    return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domain);
  }

  /**
   * Checks if a given string is a valid URL.
   * @param {string} url - The URL to check.
   * @returns {boolean} True if the URL is valid, false otherwise.
   */
  static isValid(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Combines multiple URL parts into a single path.
   * @param {...string} parts - The URL parts to combine.
   * @returns {string} The combined path.
   */
  static combine(...parts: string[]): string {
    const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, "");
    return "/" + parts.map(trimSlashes).filter(Boolean).join("/");
  }

  /**
   * Creates a UrlMage instance from an object representation of a URL.
   * @param {Object} urlObject - The object representation of the URL.
   * @param {string} [urlObject.protocol="https"] - The URL protocol.
   * @param {string} urlObject.domain - The URL domain.
   * @param {string} [urlObject.path=""] - The URL path.
   * @param {Record<string, QueryValue>} [urlObject.query={}] - The URL query parameters.
   * @param {string} [urlObject.hash=""] - The URL hash.
   * @returns {UrlMage} A new UrlMage instance.
   */
  static fromObject(urlObject: {
    protocol?: string;
    domain: string;
    path?: string;
    query?: Record<string, QueryValue>;
    hash?: string;
  }): UrlMage {
    const {
      protocol = "https",
      domain,
      path = "",
      query = {},
      hash = "",
    } = urlObject;
    const url = new UrlMage(`${protocol}://${domain}${path}`);
    url.setQueryObject(query);
    if (hash) url.setHash(hash);
    return url;
  }

  /**
   * Parses a query string into an object.
   * @param {string} queryString - The query string to parse.
   * @returns {Record<string, string | string[]>} An object representing the parsed query.
   */
  static parseQuery(queryString: string): Record<string, string | string[]> {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string | string[]> = {};
    params.forEach((value, key) => {
      if (key in result) {
        if (Array.isArray(result[key])) {
          (result[key] as string[]).push(value);
        } else {
          result[key] = [result[key] as string, value];
        }
      } else {
        result[key] = value;
      }
    });
    return result;
  }
}
