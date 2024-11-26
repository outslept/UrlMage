// Protocol Constants
export const PROTOCOLS = {
  HTTP: 'http:',
  HTTPS: 'https:',
  WS: 'ws:',
  WSS: 'wss:',
  FTP: 'ftp:',
  SFTP: 'sftp:',
  MAGNET: 'magnet:'
} as const

// URL Validation Constants
export const URL_VALIDATION = {
  MAX_LENGTH: 2048,
  MAX_HOSTNAME_LENGTH: 255,
  MAX_PATH_LENGTH: 1024,
  MAX_QUERY_LENGTH: 1024,
  MAX_FRAGMENT_LENGTH: 255,
  MAX_USERNAME_LENGTH: 64,
  MAX_PASSWORD_LENGTH: 64
} as const

// Regular Expressions
export const REGEX = {
  // RFC 3986 compliant URL regex
  URL: /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i,
  
  // IPv4 and IPv6 regex
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IPV6: /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
  
  // Domain validation
  DOMAIN: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
  SUBDOMAIN: /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i,
  
  // Path validation
  PATH: /^\/(?:[^/]+\/)*[^/]*$/,
  
  // Query string validation
  QUERY: /^[^#]*$/,
  
  // Fragment validation
  FRAGMENT: /^[^#]*$/,
  
  // Special URL patterns
  MAGNET_LINK: /^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,}/i,
  MARKET_URL: /^market:\/\/[a-z0-9._-]+$/i,
  STEAM_URL: /^steam:\/\/[a-z0-9/_-]+$/i,
  SPOTIFY_URL: /^spotify:[a-z]+:[a-z0-9]+$/i
} as const

// Security Constants
export const SECURITY = {
  SUSPICIOUS_PROTOCOLS: ['javascript:', 'data:', 'vbscript:'],
  SUSPICIOUS_PATTERNS: [
    /<script/i,
    /%3Cscript/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onclick/i,
    /onerror/i,
    /onload/i,
    /eval\(/i
  ],
  MAX_REDIRECTS: 5,
  DEFAULT_TIMEOUT: 5000
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const

// Cache Control Headers
export const CACHE_CONTROL = {
  NO_CACHE: 'no-cache',
  NO_STORE: 'no-store',
  MUST_REVALIDATE: 'must-revalidate',
  PUBLIC: 'public',
  PRIVATE: 'private',
  MAX_AGE: 'max-age='
} as const