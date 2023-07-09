---
category: feature
tag:
  - web-standard
---

# `URL` 和 `URLSearchParams`

[`URL` 标准](https://url.spec.whatwg.org/)实现。

## 模块

- [`web.url`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url.js)
- [`web.url.can-parse`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url.can-parse.js)
- [`web.url.to-json`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url.to-json.js)
- [`web.url-search-params`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url-search-params.js)
- [`web.url-search-params.delete`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url-search-params.delete.js)
- [`web.url-search-params.has`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url-search-params.has.js)
- [`web.url-search-params.size`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/web.url-search-params.size.js).

## 类型

```ts
class URL {
  constructor(url: string, base?: string);
  href: string;
  readonly origin: string;
  protocol: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  readonly searchParams: URLSearchParams;
  hash: string;
  toJSON(): string;
  toString(): string;
  static canParse(url: string, base?: string): boolean;
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
  forEach(
    callbackfn: (value: any, index: number, target: any) => void,
    thisArg: any
  ): void;
  entries(): Iterator<[key, value]>;
  keys(): Iterator<key>;
  values(): Iterator<value>;
  [Symbol.iterator](): Iterator<[key, value]>;
  readonly size: number;
}
```

## 入口点

```
core-js/proposals/url
core-js(-pure)/stable|actual|full/url
core-js(-pure)/stable|actual|full/url/can-parse
core-js/stable|actual|full/url/to-json
core-js(-pure)/stable|actual|full/url-search-params
```

## 示例

[_示例_](https://tinyurl.com/2j35uor6):

```js
URL.canParse(
  "https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment"
); // => true
URL.canParse("https"); // => false
const url = new URL(
  "https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment"
);

console.log(url.href); // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
console.log(url.origin); // => 'https://example.com:8080'
console.log(url.protocol); // => 'https:'
console.log(url.username); // => 'login'
console.log(url.password); // => 'password'
console.log(url.host); // => 'example.com:8080'
console.log(url.hostname); // => 'example.com'
console.log(url.port); // => '8080'
console.log(url.pathname); // => '/foo/bar'
console.log(url.search); // => '?a=1&b=2&a=3'
console.log(url.hash); // => '#fragment'
console.log(url.toJSON()); // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'
console.log(url.toString()); // => 'https://login:password@example.com:8080/foo/bar?a=1&b=2&a=3#fragment'

for (let [key, value] of url.searchParams) {
  console.log(key); // => 'a', 'b', 'a'
  console.log(value); // => '1', '2', '3'
}

url.pathname = "";
url.searchParams.append("c", 4);

console.log(url.search); // => '?a=1&b=2&a=3&c=4'
console.log(url.href); // => 'https://login:password@example.com:8080/?a=1&b=2&a=3&c=4#fragment'

const params = new URLSearchParams("?a=1&b=2&a=3");

params.append("c", 4);
params.append("a", 2);
params.delete("a", 1);
params.sort();

console.log(params.size); // => 4

for (let [key, value] of params) {
  console.log(key); // => 'a', 'a', 'b', 'c'
  console.log(value); // => '3', '2', '2', '4'
}

console.log(params.has('a')); // => true
console.log(params.has('a', 3)); // => true
console.log(params.has('a', 4)); // => false

console.log(params.toString()); // => 'a=3&a=2&b=2&c=4'
```

## 使用 `URL` 和 `URLSearchParams` 时的注意事项

- IE8 不支持 setter，所以 setter 在 `URL` 实例中不生效。但是 `URL` 构造函数可以用于基本的 `URL` 解析。
- 我们不支持搜索查询中的旧编码。而且 Core-JS 的实现有一些其他与编码相关的问题。
- 所有其他流行浏览器的 `URL` 实现相比 Core-JS 有更多问题，但是把它们全部换掉看起来不是个好主意。你可以[根据你的需求](../../guide/#自定义-polyfill-的启用行为)自定义使用 polyfill 的启用行为。
