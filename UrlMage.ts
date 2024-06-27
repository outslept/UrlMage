type QueryValue = string | number | boolean | null | undefined;

export class UrlMage {
  private url: URL;

  constructor(url: string) {
    try {
      this.url = new URL(url);
    } catch (error) {
      throw new Error("Invalid URL provided");
    }
  }

  // Getters
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
    const result: Record<string, string> = {};
    this.url.searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Setters
  setProtocol(protocol: string): UrlMage {
    this.url.protocol = protocol;
    return this;
  }

  setDomain(domain: string): UrlMage {
    this.url.hostname = domain;
    return this;
  }

  setPath(path: string): UrlMage {
    this.url.pathname = path;
    return this;
  }

  setQuery(key: string, value: QueryValue): UrlMage {
    if (value !== null && value !== undefined) {
      this.url.searchParams.set(key, value.toString());
    }
    return this;
  }

  // Advanced methods
  addPathSegment(segment: string): UrlMage {
    const newPath = this.path.endsWith("/")
      ? this.path + segment
      : this.path + "/" + segment;
    this.url.pathname = newPath;
    return this;
  }

  removeLastPathSegment(): UrlMage {
    const segments = this.path.split("/").filter(Boolean);
    segments.pop();
    this.url.pathname = "/" + segments.join("/");
    return this;
  }

  setQueryObject(queryObject: Record<string, QueryValue>): UrlMage {
    this.url.search = "";
    Object.entries(queryObject).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        this.url.searchParams.append(key, value.toString());
      }
    });
    return this;
  }

  appendQuery(key: string, value: QueryValue): UrlMage {
    if (value !== null && value !== undefined) {
      this.url.searchParams.append(key, value.toString());
    }
    return this;
  }

  getQueryArray(key: string): string[] {
    return this.url.searchParams.getAll(key);
  }

  toggleQueryParam(key: string, value: string): UrlMage {
    const values = this.getQueryArray(key);
    if (values.includes(value)) {
      this.url.searchParams.delete(key, value);
    } else {
      this.url.searchParams.append(key, value);
    }
    return this;
  }

  normalizeProtocol(): UrlMage {
    this.url.protocol = this.url.protocol.toLowerCase();
    return this;
  }

  normalizeDomain(): UrlMage {
    this.url.hostname = this.url.hostname.toLowerCase();
    return this;
  }

  removeTrailingSlash(): UrlMage {
    this.url.pathname = this.url.pathname.replace(/\/$/, "");
    return this;
  }

  getSegments(): string[] {
    return this.path.split("/").filter(Boolean);
  }

  isSubdomainOf(domain: string): boolean {
    const normalizedDomain = domain.toLowerCase();
    return (
      this.domain.endsWith(`.${normalizedDomain}`) &&
      this.domain !== normalizedDomain
    );
  }

  swapProtocol(newProtocol: string): UrlMage {
    this.url.protocol = newProtocol;
    return this;
  }

  removeQuery(key: string): UrlMage {
    this.url.searchParams.delete(key);
    return this;
  }

  encode(): string {
    return encodeURIComponent(this.toString());
  }

  decode(): string {
    return decodeURIComponent(this.toString());
  }

  toString(): string {
    return this.url.toString();
  }

  clone(): UrlMage {
    return new UrlMage(this.toString());
  }

  // Advanced utility methods
  getOrigin(): string {
    return this.url.origin;
  }

  hasQueryParam(key: string): boolean {
    return this.url.searchParams.has(key);
  }

  getPort(): string {
    return this.url.port;
  }

  setPort(port: number): UrlMage {
    this.url.port = port.toString();
    return this;
  }

  removePort(): UrlMage {
    this.url.port = "";
    return this;
  }

  getHash(): string {
    return this.url.hash.slice(1);
  }

  setHash(hash: string): UrlMage {
    this.url.hash = hash;
    return this;
  }

  removeHash(): UrlMage {
    this.url.hash = "";
    return this;
  }

  isAbsolute(): boolean {
    return this.url.protocol !== "";
  }

  isRelative(): boolean {
    return !this.isAbsolute();
  }

  // Static methods
  static isValid(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static combine(...parts: string[]): string {
    const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, "");
    return "/" + parts.map(trimSlashes).filter(Boolean).join("/");
  }

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
