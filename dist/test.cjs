"use strict";

// UrlMage.ts
var UrlMage = class _UrlMage {
  url;
  constructor(url2) {
    try {
      this.url = new URL(url2);
    } catch (error) {
      throw new Error("Invalid URL provided");
    }
  }
  // Getters
  get protocol() {
    return this.url.protocol.slice(0, -1);
  }
  get domain() {
    return this.url.hostname;
  }
  get path() {
    return this.url.pathname;
  }
  get query() {
    const result = {};
    this.url.searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  // Setters
  setProtocol(protocol) {
    this.url.protocol = protocol;
    return this;
  }
  setDomain(domain) {
    this.url.hostname = domain;
    return this;
  }
  setPath(path) {
    this.url.pathname = path;
    return this;
  }
  setQuery(key, value) {
    if (value !== null && value !== void 0) {
      this.url.searchParams.set(key, value.toString());
    }
    return this;
  }
  // Advanced methods
  addPathSegment(segment) {
    const newPath = this.path.endsWith("/") ? this.path + segment : this.path + "/" + segment;
    this.url.pathname = newPath;
    return this;
  }
  removeLastPathSegment() {
    const segments = this.path.split("/").filter(Boolean);
    segments.pop();
    this.url.pathname = "/" + segments.join("/");
    return this;
  }
  setQueryObject(queryObject) {
    this.url.search = "";
    Object.entries(queryObject).forEach(([key, value]) => {
      if (value !== null && value !== void 0) {
        this.url.searchParams.append(key, value.toString());
      }
    });
    return this;
  }
  appendQuery(key, value) {
    if (value !== null && value !== void 0) {
      this.url.searchParams.append(key, value.toString());
    }
    return this;
  }
  getQueryArray(key) {
    return this.url.searchParams.getAll(key);
  }
  toggleQueryParam(key, value) {
    const values = this.getQueryArray(key);
    if (values.includes(value)) {
      this.url.searchParams.delete(key, value);
    } else {
      this.url.searchParams.append(key, value);
    }
    return this;
  }
  normalizeProtocol() {
    this.url.protocol = this.url.protocol.toLowerCase();
    return this;
  }
  normalizeDomain() {
    this.url.hostname = this.url.hostname.toLowerCase();
    return this;
  }
  removeTrailingSlash() {
    this.url.pathname = this.url.pathname.replace(/\/$/, "");
    return this;
  }
  getSegments() {
    return this.path.split("/").filter(Boolean);
  }
  isSubdomainOf(domain) {
    const normalizedDomain = domain.toLowerCase();
    return this.domain.endsWith(`.${normalizedDomain}`) && this.domain !== normalizedDomain;
  }
  swapProtocol(newProtocol) {
    this.url.protocol = newProtocol;
    return this;
  }
  removeQuery(key) {
    this.url.searchParams.delete(key);
    return this;
  }
  encode() {
    return encodeURIComponent(this.toString());
  }
  decode() {
    return decodeURIComponent(this.toString());
  }
  toString() {
    return this.url.toString();
  }
  clone() {
    return new _UrlMage(this.toString());
  }
  // Advanced utility methods
  getOrigin() {
    return this.url.origin;
  }
  hasQueryParam(key) {
    return this.url.searchParams.has(key);
  }
  getPort() {
    return this.url.port;
  }
  setPort(port) {
    this.url.port = port.toString();
    return this;
  }
  removePort() {
    this.url.port = "";
    return this;
  }
  getHash() {
    return this.url.hash.slice(1);
  }
  setHash(hash) {
    this.url.hash = hash;
    return this;
  }
  removeHash() {
    this.url.hash = "";
    return this;
  }
  isAbsolute() {
    return this.url.protocol !== "";
  }
  isRelative() {
    return !this.isAbsolute();
  }
  // Static methods
  static isValid(url2) {
    try {
      new URL(url2);
      return true;
    } catch {
      return false;
    }
  }
  static combine(...parts) {
    const trimSlashes = (s) => s.replace(/^\/+|\/+$/g, "");
    return "/" + parts.map(trimSlashes).filter(Boolean).join("/");
  }
  static fromObject(urlObject) {
    const {
      protocol = "https",
      domain,
      path = "",
      query = {},
      hash = ""
    } = urlObject;
    const url2 = new _UrlMage(`${protocol}://${domain}${path}`);
    url2.setQueryObject(query);
    if (hash) url2.setHash(hash);
    return url2;
  }
  static parseQuery(queryString2) {
    const params = new URLSearchParams(queryString2);
    const result = {};
    params.forEach((value, key) => {
      if (key in result) {
        if (Array.isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    });
    return result;
  }
};

// test.ts
var baseUrl = "https://example.com/path/to/page?param1=value1&param2=value2#section1";
console.log("--- Basic Usage ---");
var url = new UrlMage(baseUrl);
console.log("Original URL:", url.toString());
console.log("Protocol:", url.protocol);
console.log("Domain:", url.domain);
console.log("Path:", url.path);
console.log("Query:", url.query);
console.log("Hash:", url.getHash());
console.log("\n--- Modifying URL ---");
url.setProtocol("http").setDomain("newexample.com").setPath("/new/path").setQuery("newParam", "newValue").setHash("newSection");
console.log("Modified URL:", url.toString());
console.log("\n--- Query Manipulation ---");
url.appendQuery("arrayParam", "value1");
url.appendQuery("arrayParam", "value2");
console.log("URL with array parameter:", url.toString());
console.log("Array parameter values:", url.getQueryArray("arrayParam"));
url.toggleQueryParam("toggleParam", "on");
console.log("URL with toggled parameter:", url.toString());
url.toggleQueryParam("toggleParam", "on");
console.log("URL with parameter toggled off:", url.toString());
console.log("\n--- Path Manipulation ---");
url.addPathSegment("subpage");
console.log("URL with added path segment:", url.toString());
url.removeLastPathSegment();
console.log("URL with removed last path segment:", url.toString());
console.log("\n--- URL Normalization ---");
var messyUrl = new UrlMage("HTTPS://ExAmPlE.CoM/PATH///to/page/");
console.log("Messy URL:", messyUrl.toString());
messyUrl.normalizeProtocol().normalizeDomain().removeTrailingSlash();
console.log("Normalized URL:", messyUrl.toString());
console.log("\n--- Static Methods ---");
console.log("Is valid URL:", UrlMage.isValid("https://example.com"));
console.log("Is valid URL:", UrlMage.isValid("not-a-url"));
console.log("Combined path:", UrlMage.combine("path", "to", "page"));
var urlFromObject = UrlMage.fromObject({
  protocol: "https",
  domain: "example.com",
  path: "/api",
  query: { key: "value" },
  hash: "section"
});
console.log("URL from object:", urlFromObject.toString());
console.log("\n--- Parsing Query ---");
var queryString = "param1=value1&param2=value2&param3=value3a&param3=value3b";
console.log("Parsed query:", UrlMage.parseQuery(queryString));
