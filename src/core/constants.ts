import { STATUS_CODES } from 'node:http'
import { constants as httpConstants } from 'node:http2'

// Protocol Constants
export const PROTOCOLS = {
  HTTP: 'http:',
  HTTPS: 'https:',
  WS: 'ws:',
  WSS: 'wss:',
  FTP: 'ftp:',
  SFTP: 'sftp:',
  FILE: 'file:',
  DATA: 'data:',
  MAILTO: 'mailto:',
  TEL: 'tel:',
  SMS: 'sms:',
  MAGNET: 'magnet:',
  BITCOIN: 'bitcoin:',
  GEO: 'geo:',
  MARKET: 'market:',
  STEAM: 'steam:',
  SPOTIFY: 'spotify:',
  WHATSAPP: 'whatsapp:',
  TELEGRAM: 'tg:',
  DISCORD: 'discord:',
  SKYPE: 'skype:',
  CHROME: 'chrome:',
  EDGE: 'edge:',
  FIREFOX: 'firefox:',
} as const

// URL Validation Constants
export const URL_VALIDATION = {
  MAX_LENGTH: 2048, // Общая максимальная длина URL
  MAX_HOSTNAME_LENGTH: 255, // Максимальная длина хоста
  MAX_PATH_LENGTH: 1024, // Максимальная длина пути
  MAX_QUERY_LENGTH: 2048, // Максимальная длина строки запроса
  MAX_FRAGMENT_LENGTH: 255, // Максимальная длина фрагмента
  MAX_USERNAME_LENGTH: 64, // Максимальная длина имени пользователя
  MAX_PASSWORD_LENGTH: 64, // Максимальная длина пароля
  MAX_PORT: 65535, // Максимальное значение порта
  MIN_PORT: 1, // Минимальное значение порта
  COMMON_PORTS: {
    // Часто используемые порты
    HTTP: 80,
    HTTPS: 443,
    FTP: 21,
    SFTP: 22,
    SSH: 22,
    TELNET: 23,
    SMTP: 25,
    DNS: 53,
    POP3: 110,
    IMAP: 143,
    LDAP: 389,
    HTTPS_ALT: 8443,
    HTTP_ALT: 8080,
    PROXY: 8888,
    MYSQL: 3306,
    POSTGRESQL: 5432,
    MONGODB: 27017,
    REDIS: 6379,
  },
} as const

// Regular Expressions
export const REGEX = {
  // IP адреса - для отдельной валидации
  IPV4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  IPV6: /^(?:(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,7}:|(?:[0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,5}(?::[0-9a-f]{1,4}){1,2}|(?:[0-9a-f]{1,4}:){1,4}(?::[0-9a-f]{1,4}){1,3}|(?:[0-9a-f]{1,4}:){1,3}(?::[0-9a-f]{1,4}){1,4}|(?:[0-9a-f]{1,4}:){1,2}(?::[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:(?::[0-9a-f]{1,4}){1,6}|:(?:(?::[0-9a-f]{1,4}){1,7}|:))$/i,
  IPV4_CIDR:
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\/(?:\d|[12]\d|3[0-2])$/,

  // Специальные URL-схемы (не обрабатываемые URL API)
  MAGNET_LINK: /^magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32,}/i,
  SPOTIFY_URI: /^spotify:[a-z]+:[a-z0-9]+$/i,

  // Опасные паттерны для проверки безопасности
  XSS_PATTERNS: [
    /<script\b[^>]*>(.*?)<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*"[^"]*"/gi,
    /on\w+\s*=\s*'[^']*'/gi,
    /on\w+\s*=[^"'\s>]+/gi,
  ],
  SQL_INJECTION: [
    /%27|'|--|%23|#/,
    /((%3D)|=)[^\n]*((%27)|'|--|%3B|%2B|%20)/i,
    /\w*((%27)|')((%6F)|o|(%4F))((%72)|r|(%52))/i,
    /((%27)|')union/i,
  ],
} as const

// Security Constants - расширенный набор
export const SECURITY = {
  // Подозрительные протоколы
  SUSPICIOUS_PROTOCOLS: [
    'javascript:',
    'data:',
    'vbscript:',
    'jscript:',
    'livescript:',
    'mocha:',
    'about:',
    'blob:',
    'jar:',
    'resource:',
  ],

  // Подозрительные шаблоны
  SUSPICIOUS_PATTERNS: [
    /<script/i,
    /%3Cscript/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onclick/i,
    /onmouseover/i,
    /onload/i,
    /onerror/i,
    /onsubmit/i,
    /onchange/i,
    /onfocus/i,
    /onblur/i,
    /onkeydown/i,
    /onkeypress/i,
    /onkeyup/i,
    /eval\(/i,
    /setTimeout\(/i,
    /setInterval\(/i,
    /Function\(/i,
    /document\.cookie/i,
    /document\.write/i,
    /document\.location/i,
    /window\.location/i,
    /\.innerHTML/i,
    /\.outerHTML/i,
    /\.insertAdjacentHTML/i,
    /execScript/i,
    /fromCharCode/i,
    /encodeURIComponent\(/i,
    /decodeURIComponent\(/i,
    /atob\(/i,
    /btoa\(/i,
  ],

  // Параметры безопасности
  MAX_REDIRECTS: 10,
  DEFAULT_TIMEOUT: 10000,

  // Open Redirect уязвимости
  OPEN_REDIRECT_PARAMS: [
    'url',
    'redirect',
    'redirectUrl',
    'redirect_uri',
    'return',
    'returnUrl',
    'return_url',
    'next',
    'goto',
    'to',
    'link',
    'location',
    'dest',
    'destination',
  ],

  // Content Security Policy
  CSP_DIRECTIVES: {
    DEFAULT_SRC: 'default-src',
    SCRIPT_SRC: 'script-src',
    STYLE_SRC: 'style-src',
    IMG_SRC: 'img-src',
    CONNECT_SRC: 'connect-src',
    FONT_SRC: 'font-src',
    OBJECT_SRC: 'object-src',
    MEDIA_SRC: 'media-src',
    FRAME_SRC: 'frame-src',
    FRAME_ANCESTORS: 'frame-ancestors',
    FORM_ACTION: 'form-action',
  },

  // HTTP Security Headers
  SECURITY_HEADERS: {
    CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
    STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
    X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
    X_FRAME_OPTIONS: 'X-Frame-Options',
    X_XSS_PROTECTION: 'X-XSS-Protection',
    REFERRER_POLICY: 'Referrer-Policy',
    PERMISSIONS_POLICY: 'Permissions-Policy',
  },

  // CORS Headers
  CORS_HEADERS: {
    ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
    ALLOW_METHODS: 'Access-Control-Allow-Methods',
    ALLOW_HEADERS: 'Access-Control-Allow-Headers',
    ALLOW_CREDENTIALS: 'Access-Control-Allow-Credentials',
    EXPOSE_HEADERS: 'Access-Control-Expose-Headers',
    MAX_AGE: 'Access-Control-Max-Age',
  },
} as const

// Export HTTP status codes from Node.js
export { STATUS_CODES }

// HTTP/2 constants
export { httpConstants as HTTP2_CONSTANTS }

// Cache Control Headers
export const CACHE_CONTROL = {
  NO_CACHE: 'no-cache',
  NO_STORE: 'no-store',
  NO_TRANSFORM: 'no-transform',
  MUST_REVALIDATE: 'must-revalidate',
  PROXY_REVALIDATE: 'proxy-revalidate',
  PUBLIC: 'public',
  PRIVATE: 'private',
  MAX_AGE: 'max-age=',
  S_MAX_AGE: 's-maxage=',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate=',
  STALE_IF_ERROR: 'stale-if-error=',
} as const

// Content Types
export const CONTENT_TYPES = {
  APPLICATION_JSON: 'application/json',
  APPLICATION_XML: 'application/xml',
  APPLICATION_FORM_URLENCODED: 'application/x-www-form-urlencoded',
  APPLICATION_OCTET_STREAM: 'application/octet-stream',
  APPLICATION_PDF: 'application/pdf',
  APPLICATION_ZIP: 'application/zip',
  TEXT_PLAIN: 'text/plain',
  TEXT_HTML: 'text/html',
  TEXT_CSS: 'text/css',
  TEXT_JAVASCRIPT: 'text/javascript',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_GIF: 'image/gif',
  IMAGE_WEBP: 'image/webp',
  IMAGE_SVG: 'image/svg+xml',
  AUDIO_MPEG: 'audio/mpeg',
  AUDIO_OGG: 'audio/ogg',
  VIDEO_MP4: 'video/mp4',
  VIDEO_WEBM: 'video/webm',
  MULTIPART_FORM_DATA: 'multipart/form-data',
} as const

// Специальные сервисы и их URL-форматы
export const SPECIAL_SERVICES = {
  // Социальные сети
  FACEBOOK: {
    DOMAIN: 'facebook.com',
    PROFILE: 'https://facebook.com/{username}',
    PAGE: 'https://facebook.com/{pagename}',
    POST: 'https://facebook.com/{username}/posts/{postId}',
  },
  TWITTER: {
    DOMAIN: 'twitter.com',
    PROFILE: 'https://twitter.com/{username}',
    STATUS: 'https://twitter.com/{username}/status/{statusId}',
  },
  INSTAGRAM: {
    DOMAIN: 'instagram.com',
    PROFILE: 'https://instagram.com/{username}',
    POST: 'https://instagram.com/p/{shortcode}',
  },
  LINKEDIN: {
    DOMAIN: 'linkedin.com',
    PROFILE: 'https://linkedin.com/in/{username}',
    COMPANY: 'https://linkedin.com/company/{companyId}',
  },
  REDDIT: {
    DOMAIN: 'reddit.com',
    SUBREDDIT: 'https://reddit.com/r/{subreddit}',
    USER: 'https://reddit.com/user/{username}',
    POST: 'https://reddit.com/r/{subreddit}/comments/{postId}',
  },

  // Видеоплатформы
  YOUTUBE: {
    DOMAIN: 'youtube.com',
    VIDEO: 'https://youtube.com/watch?v={videoId}',
    CHANNEL: 'https://youtube.com/channel/{channelId}',
    USER: 'https://youtube.com/user/{username}',
    SHORT: 'https://youtu.be/{videoId}',
  },
  VIMEO: {
    DOMAIN: 'vimeo.com',
    VIDEO: 'https://vimeo.com/{videoId}',
  },
  TWITCH: {
    DOMAIN: 'twitch.tv',
    CHANNEL: 'https://twitch.tv/{channelName}',
    VIDEO: 'https://twitch.tv/videos/{videoId}',
  },

  // Мессенджеры
  TELEGRAM: {
    DOMAIN: 't.me',
    CHANNEL: 'https://t.me/{channelName}',
    USER: 'https://t.me/{username}',
    GROUP: 'https://t.me/joinchat/{inviteHash}',
    DEEP_LINK: 'tg://resolve?domain={domain}',
  },
  WHATSAPP: {
    DOMAIN: 'whatsapp.com',
    CHAT: 'https://wa.me/{phoneNumber}',
    GROUP: 'https://chat.whatsapp.com/{inviteCode}',
    DEEP_LINK: 'whatsapp://send?phone={phoneNumber}&text={text}',
  },
  DISCORD: {
    DOMAIN: 'discord.com',
    INVITE: 'https://discord.gg/{inviteCode}',
    SERVER: 'https://discord.com/channels/{serverId}',
    CHANNEL: 'https://discord.com/channels/{serverId}/{channelId}',
  },

  // Код и репозитории
  GITHUB: {
    DOMAIN: 'github.com',
    USER: 'https://github.com/{username}',
    REPO: 'https://github.com/{username}/{repoName}',
    ISSUE: 'https://github.com/{username}/{repoName}/issues/{issueNumber}',
    PR: 'https://github.com/{username}/{repoName}/pull/{prNumber}',
    GIST: 'https://gist.github.com/{username}/{gistId}',
  },
  GITLAB: {
    DOMAIN: 'gitlab.com',
    USER: 'https://gitlab.com/{username}',
    REPO: 'https://gitlab.com/{username}/{repoName}',
    ISSUE: 'https://gitlab.com/{username}/{repoName}/-/issues/{issueNumber}',
  },
  BITBUCKET: {
    DOMAIN: 'bitbucket.org',
    USER: 'https://bitbucket.org/{username}',
    REPO: 'https://bitbucket.org/{username}/{repoName}',
  },

  // Музыкальные сервисы
  SPOTIFY: {
    DOMAIN: 'spotify.com',
    TRACK: 'https://open.spotify.com/track/{trackId}',
    ALBUM: 'https://open.spotify.com/album/{albumId}',
    ARTIST: 'https://open.spotify.com/artist/{artistId}',
    PLAYLIST: 'https://open.spotify.com/playlist/{playlistId}',
    DEEP_LINK: 'spotify:{type}:{id}',
  },
  APPLE_MUSIC: {
    DOMAIN: 'music.apple.com',
    TRACK:
      'https://music.apple.com/{countryCode}/album/{albumName}/{albumId}?i={trackId}',
    ALBUM: 'https://music.apple.com/{countryCode}/album/{albumName}/{albumId}',
    ARTIST:
      'https://music.apple.com/{countryCode}/artist/{artistName}/{artistId}',
  },

  // Игровые платформы
  STEAM: {
    DOMAIN: 'steampowered.com',
    STORE: 'https://store.steampowered.com/app/{appId}',
    COMMUNITY: 'https://steamcommunity.com/id/{userId}',
    PROFILE: 'https://steamcommunity.com/profiles/{steamId64}',
    DEEP_LINK: 'steam://rungameid/{appId}',
  },
  EPIC_GAMES: {
    DOMAIN: 'epicgames.com',
    STORE: 'https://www.epicgames.com/store/product/{productName}/{productId}',
  },

  // Магазины приложений
  GOOGLE_PLAY: {
    DOMAIN: 'play.google.com',
    APP: 'https://play.google.com/store/apps/details?id={packageName}',
    DEEP_LINK: 'market://details?id={packageName}',
  },
  APP_STORE: {
    DOMAIN: 'apps.apple.com',
    APP: 'https://apps.apple.com/{countryCode}/app/{appName}/id{appId}',
    DEEP_LINK: 'itms-apps://itunes.apple.com/app/id{appId}',
  },
} as const
