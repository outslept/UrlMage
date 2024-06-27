import { UrlMage } from './UrlMage';

const baseUrl = 'https://example.com/path/to/page?param1=value1&param2=value2#section1';

console.log('--- Basic Usage ---');
const url = new UrlMage(baseUrl);
console.log('Original URL:', url.toString());
console.log('Protocol:', url.protocol);
console.log('Domain:', url.domain);
console.log('Path:', url.path);
console.log('Query:', url.query);
console.log('Hash:', url.getHash());

console.log('\n--- Modifying URL ---');
url.setProtocol('http')
   .setDomain('newexample.com')
   .setPath('/new/path')
   .setQuery('newParam', 'newValue')
   .setHash('newSection');
console.log('Modified URL:', url.toString());

console.log('\n--- Query Manipulation ---');
url.appendQuery('arrayParam', 'value1');
url.appendQuery('arrayParam', 'value2');
console.log('URL with array parameter:', url.toString());
console.log('Array parameter values:', url.getQueryArray('arrayParam'));

url.toggleQueryParam('toggleParam', 'on');
console.log('URL with toggled parameter:', url.toString());
url.toggleQueryParam('toggleParam', 'on');
console.log('URL with parameter toggled off:', url.toString());

console.log('\n--- Path Manipulation ---');
url.addPathSegment('subpage');
console.log('URL with added path segment:', url.toString());
url.removeLastPathSegment();
console.log('URL with removed last path segment:', url.toString());

console.log('\n--- URL Normalization ---');
const messyUrl = new UrlMage('HTTPS://ExAmPlE.CoM/PATH///to/page/');
console.log('Messy URL:', messyUrl.toString());
messyUrl.normalizeProtocol().normalizeDomain().removeTrailingSlash();
console.log('Normalized URL:', messyUrl.toString());

console.log('\n--- Static Methods ---');
console.log('Is valid URL:', UrlMage.isValid('https://example.com'));
console.log('Is valid URL:', UrlMage.isValid('not-a-url'));

console.log('Combined path:', UrlMage.combine('path', 'to', 'page'));

const urlFromObject = UrlMage.fromObject({
  protocol: 'https',
  domain: 'example.com',
  path: '/api',
  query: { key: 'value' },
  hash: 'section'
});
console.log('URL from object:', urlFromObject.toString());

console.log('\n--- Parsing Query ---');
const queryString = 'param1=value1&param2=value2&param3=value3a&param3=value3b';
console.log('Parsed query:', UrlMage.parseQuery(queryString));