---
home: true
icon: home
title: 主页
heroImage: /logo.png
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

## 使用示例

::: code-tabs#js

@tab 基础用法
```js
//https://tinyurl.com/2mknex43
import 'core-js/actual';
Promise.resolve(42).then(it => console.log(it)); // => 42
Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]
[1, 2].flatMap(it => [it, it]); // => [1, 1, 2, 2]
(function * (i) { while (true) yield i++; })(1)
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]
structuredClone(new Set([1, 2, 3])); // => new Set([1, 2, 3])
```

@tab 按需加载
```js
import 'core-js/actual/promise';
import 'core-js/actual/set';
import 'core-js/actual/iterator';
import 'core-js/actual/array/from';
import 'core-js/actual/array/flat-map';
import 'core-js/actual/structured-clone';
Promise.resolve(42).then(it => console.log(it)); // => 42
Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]
[1, 2].flatMap(it => [it, it]); // => [1, 1, 2, 2]
(function * (i) { while (true) yield i++; })(1)
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]
structuredClone(new Set([1, 2, 3])); // => new Set([1, 2, 3])
```

@tab 无全局污染
```js
import Promise from 'core-js-pure/actual/promise';
import Set from 'core-js-pure/actual/set';
import Iterator from 'core-js-pure/actual/iterator';
import from from 'core-js-pure/actual/array/from';
import flatMap from 'core-js-pure/actual/array/flat-map';
import structuredClone from 'core-js-pure/actual/structured-clone';
Promise.resolve(42).then(it => console.log(it)); // => 42
from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]
flatMap([1, 2], it => [it, it]); // => [1, 1, 2, 2]
Iterator.from(function * (i) { while (true) yield i++; }(1))
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]
structuredClone(new Set([1, 2, 3])); // => new Set([1, 2, 3])
```
:::