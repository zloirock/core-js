---
home: true
icon: home
title: 主页
heroImage: /logo.svg
heroImageDark: /logo-dark.svg
heroText: Core-JS
tagline: 在开发中使用最新的ECMAScript特性, 无需担心浏览器兼容性
actions:
  - text: 使用指南💡
    link: guide/
    type: primary

  - text: 赞助🧡
    link: donate.md

features:
  - title: 按需加载
    icon: module
    details: 不污染全局命名空间

  - title: 应用广泛
    icon: ability
    details: 最受欢迎的 JavaScript polyfill，NPM 月下载量超过 2.5 亿次

  - title: 轻松上手
    icon: light
    details: 与 Babel 和 SWC 等工具集成

  - title: 功能强大
    icon: strong
    details: 包括对从 ES5 到进行中的 ECMAScript 提案的 polyfill
---

## 赞助商

`core-js` 没有公司支持，所以这个项目的未来取决于你。如果你对 `core-js` 感兴趣，请[成为赞助商或支持者](./donate.md)。

<div class="no-ext-link-icon">

[![sponsor1](https://opencollective.com/core-js/sponsor/0/avatar.svg)](https://opencollective.com/core-js/sponsor/0/website)
[![sponsor2](https://opencollective.com/core-js/sponsor/1/avatar.svg)](https://opencollective.com/core-js/sponsor/1/website)
[![sponsor3](https://opencollective.com/core-js/sponsor/2/avatar.svg)](https://opencollective.com/core-js/sponsor/2/website)
[![sponsor4](https://opencollective.com/core-js/sponsor/3/avatar.svg)](https://opencollective.com/core-js/sponsor/3/website)
[![sponsor5](https://opencollective.com/core-js/sponsor/4/avatar.svg)](https://opencollective.com/core-js/sponsor/4/website)
[![sponsor6](https://opencollective.com/core-js/sponsor/5/avatar.svg)](https://opencollective.com/core-js/sponsor/5/website)
[![sponsor7](https://opencollective.com/core-js/sponsor/6/avatar.svg)](https://opencollective.com/core-js/sponsor/6/website)
[![sponsor8](https://opencollective.com/core-js/sponsor/7/avatar.svg)](https://opencollective.com/core-js/sponsor/7/website)
[![sponsor9](https://opencollective.com/core-js/sponsor/8/avatar.svg)](https://opencollective.com/core-js/sponsor/8/website)
[![sponsor10](https://opencollective.com/core-js/sponsor/9/avatar.svg)](https://opencollective.com/core-js/sponsor/9/website)
[![sponsor11](https://opencollective.com/core-js/sponsor/10/avatar.svg)](https://opencollective.com/core-js/sponsor/10/website)
[![sponsor12](https://opencollective.com/core-js/sponsor/11/avatar.svg)](https://opencollective.com/core-js/sponsor/11/website)

</div>
%COREJS_VERSION%

::: details 更多支持者
[![backers](https://opencollective.com/core-js/backers.svg?width=1200)](https://opencollective.com/core-js#backers){ .no-ext-link-icon }
:::

### 使用示例

::: code-tabs#js

@tab 基础用法

```js
// https://tinyurl.com/2mknex43
import "core-js/actual";
Promise.resolve(42).then((it) => console.log(it)); // => 42
Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]
[1, 2].flatMap((it) => [it, it]); // => [1, 1, 2, 2]
(function* (i) {
  while (true) yield i++;
})(1)
  .drop(1)
  .take(5)
  .filter((it) => it % 2)
  .map((it) => it ** 2)
  .toArray(); // => [9, 25]
structuredClone(new Set([1, 2, 3])); // => new Set([1, 2, 3])
```

@tab 按需加载

```js
import "core-js/actual/promise";
import "core-js/actual/set";
import "core-js/actual/iterator";
import "core-js/actual/array/from";
import "core-js/actual/array/flat-map";
import "core-js/actual/structured-clone";
Promise.resolve(42).then((it) => console.log(it)); // => 42
Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]
[1, 2].flatMap((it) => [it, it]); // => [1, 1, 2, 2]
(function* (i) {
  while (true) yield i++;
})(1)
  .drop(1)
  .take(5)
  .filter((it) => it % 2)
  .map((it) => it ** 2)
  .toArray(); // => [9, 25]
structuredClone(new Set([1, 2, 3])); // => new Set([1, 2, 3])
```

@tab 无全局污染

```js
import Promise from "core-js-pure/actual/promise";
import Set from "core-js-pure/actual/set";
import Iterator from "core-js-pure/actual/iterator";
import from from "core-js-pure/actual/array/from";
import flatMap from "core-js-pure/actual/array/flat-map";
import structuredClone from "core-js-pure/actual/structured-clone";
Promise.resolve(42).then((it) => console.log(it)); // => 42
from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]
flatMap([1, 2], (it) => [it, it]); // => [1, 1, 2, 2]
Iterator.from(
  (function* (i) {
    while (true) yield i++;
  })(1)
)
  .drop(1)
  .take(5)
  .filter((it) => it % 2)
  .map((it) => it ** 2)
  .toArray(); // => [9, 25]
structuredClone(new Set([1, 2, 3])); // => new Set([1, 2, 3])
```

@tab Deno

```js
import "https://deno.land/x/corejs@v%COREJS_VERSION%/index.js"; // <- at the top of your entry point
Promise.resolve(42).then((it) => console.log(it)); // => 42
Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]
[1, 2].flatMap((it) => [it, it]); // => [1, 1, 2, 2]
(function* (i) {
  while (true) yield i++;
})(1)
  .drop(1)
  .take(5)
  .filter((it) => it % 2)
  .map((it) => it ** 2)
  .toArray(); // => [9, 25]
structuredClone(new Set([1, 2, 3])); // => new Set([1, 2, 3])
```

:::
