export const WELL_KNOWN_PROTOCOLS = {
  WEB: ['http', 'https'],
  FILE: ['file', 'ftp', 'sftp', 'ftps'],
  MAIL: ['mailto', 'smtp', 'smtps', 'imap', 'imaps', 'pop3', 'pop3s'],
  MESSAGING: ['ws', 'wss', 'mqtt', 'amqp'],
  MEDIA: ['rtmp', 'rtsp'],
  OTHER: ['ssh', 'telnet', 'ldap', 'ldaps', 'git', 'svn'],
}

export const SECURE_PROTOCOLS = [
  'https',
  'wss',
  'sftp',
  'ftps',
  'smtps',
  'imaps',
  'pop3s',
  'ldaps',
  'ssh',
]

export const DEPRECATED_PROTOCOLS = [
  'telnet',
  'gopher',
  'wais',
  'ftp',
]

export const DANGEROUS_PROTOCOLS = [
  'javascript',
  'data',
  'vbscript',
  'jscript',
  'livescript',
  'mocha',
]

export const PROTOCOL_SECURITY_MAP: Record<string, string | undefined> = {
  http: 'https',
  ws: 'wss',
  ftp: 'sftp',
  smtp: 'smtps',
  imap: 'imaps',
  pop3: 'pop3s',
  ldap: 'ldaps',
}

export const DEFAULT_PORTS: Record<string, number> = {
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
  ftp: 21,
  sftp: 22,
  ftps: 990,
  ssh: 22,
  smtp: 25,
  smtps: 465,
  imap: 143,
  imaps: 993,
  pop3: 110,
  pop3s: 995,
  ldap: 389,
  ldaps: 636,
  rtmp: 1935,
  rtsp: 554,
  mqtt: 1883,
  amqp: 5672,
}

export const PROTOCOL_USAGE_MAP: Record<string, string[]> = {
  browsing: ['http', 'https', 'file'],
  download: ['http', 'https', 'ftp', 'sftp', 'ftps', 'file'],
  upload: ['http', 'https', 'ftp', 'sftp', 'ftps'],
  streaming: ['http', 'https', 'ws', 'wss', 'rtmp', 'rtsp'],
  messaging: ['ws', 'wss', 'mqtt', 'amqp'],
}

export const PORT_CATEGORIES = {
  WELL_KNOWN: { min: 0, max: 1023 },
  REGISTERED: { min: 1024, max: 49151 },
  DYNAMIC: { min: 49152, max: 65535 },
}

export const VALID_PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*$/
