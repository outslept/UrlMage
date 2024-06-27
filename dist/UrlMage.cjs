"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// UrlMage.ts
var UrlMage_exports = {};
__export(UrlMage_exports, {
  UrlMage: () => UrlMage
});
module.exports = __toCommonJS(UrlMage_exports);
var UrlMage = class _UrlMage {
  url;
  constructor(url) {
    try {
      this.url = new URL(url);
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
  static isValid(url) {
    try {
      new URL(url);
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
    const url = new _UrlMage(`${protocol}://${domain}${path}`);
    url.setQueryObject(query);
    if (hash) url.setHash(hash);
    return url;
  }
  static parseQuery(queryString) {
    const params = new URLSearchParams(queryString);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UrlMage
});
