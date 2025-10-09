# `URL` and `URLSearchParams`
[`URL` standard](https://url.spec.whatwg.org/) implementation. 

## Modules 
[`web.url.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.url.constructor.js), [`web.url.can-parse`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.url.can-parse.js), [`web.url.parse`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.url.parse.js), [`web.url.to-json`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.url.to-json.js), [`web.url-search-params.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.url-search-params.constructor.js), [`web.url-search-params.delete`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.url-search-params.delete.js), [`web.url-search-params.has`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.url-search-params.has.js), [`web.url-search-params.size`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/web.url-search-params.size.js).

## Built-ins signatures
```ts
class URL {
  constructor(url: string, base?: string);
  attribute href: string;
  readonly attribute origin: string;
  attribute protocol: string;
  attribute username: string;
  attribute password: string;
  attribute host: string;
  attribute hostname: string;
  attribute port: string;
  attribute pathname: string;
  attribute search: string;
  readonly attribute searchParams: URLSearchParams;
  attribute hash: string;
  toJSON(): string;
  toString(): string;
  static canParse(url: string, base?: string): boolean;
  static parse(url: string, base?: string): URL | null;
}

class URLSearchParams {
  constructor(params?: string | Iterable<[key, value]> | Object);
  append(name: string, value: string): void;
  delete(name: string, value?: string): void;
  get(name: string): string | void;
  getAll(name: string): Array<string>;
  has(name: string, value?: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  forEach(callbackfn: (value: any, index: number, target: any) => void, thisArg: any): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  @@iterator(): Iterator<[key, value]>;
  readonly attribute size: number;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/url
core-js(-pure)/stable|actual|full/url
core-js(-pure)/stable|actual|full/url/can-parse
core-js/stable|actual|full/url/to-json
core-js(-pure)/stable|actual|full/url-search-params
```

## Examples
```js
URL.canParse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'); // => true
URL.canParse('https'); // => false

URL.parse('https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'); // => url
URL.parse('https'); // => null

const url = new URL('https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment');

console.log(url.href);       // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
console.log(url.origin);     // => 'https://example.com:8080'
console.log(url.protocol);   // => 'https:'
console.log(url.username);   // => 'login'
console.log(url.password);   // => 'password'
console.log(url.host);       // => 'example.com:8080'
console.log(url.hostname);   // => 'example.com'
console.log(url.port);       // => '8080'
console.log(url.pathname);   // => '/foo/bar'
console.log(url.search);     // => '?a=1&b=2&a=3'
console.log(url.hash);       // => '#fragment'
console.log(url.toJSON());   // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
console.log(url.toString()); // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'

for (let [key, value] of url.searchParams) {
  console.log(key);   // => 'a', 'b', 'a'
  console.log(value); // => '1', '2', '3'
}

url.pathname = '';
url.searchParams.append('c', 4);

console.log(url.search); // => '?a=1&b=2&a=3&c=4'
console.log(url.href);   // => 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'

const params = new URLSearchParams('?a=1&b=2&a=3');

params.append('c', 4);
params.append('a', 2);
params.delete('a', 1);
params.sort();

console.log(params.size); // => 4

for (let [key, value] of params) {
  console.log(key);   // => 'a', 'a', 'b', 'c'
  console.log(value); // => '3', '2', '2', '4'
}

console.log(params.has('a')); // => true
console.log(params.has('a', 3)); // => true
console.log(params.has('a', 4)); // => false

console.log(params.toString()); // => 'a=3&a=2&b=2&c=4'
```

> [!WARNING]
> - IE8 does not support setters, so they do not work on `URL` instances. However, `URL` constructor can be used for basic `URL` parsing.
> - Legacy encodings in a search query are not supported. Also, `core-js` implementation has some other encoding-related issues.
> - `URL` implementations from all of the popular browsers have significantly more problems than `core-js`, however, replacing all of them does not look like a good idea. You can customize the aggressiveness of polyfill [by your requirements](#configurable-level-of-aggressiveness).
