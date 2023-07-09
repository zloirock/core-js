---
home: true
icon: home
title: Home
heroImage: /logo.svg
heroImageDark: /logo-dark.svg
heroText: Core-JS
tagline: Use the latest ECMAScript features before they are widely supported
actions:
  - text: How to Use💡
    link: guide/
    type: primary

  - text: Sponsor🧡
    link: donate.md

features:
  - title: Modularization
    icon: module
    details: On-demand loading and no global namespace pollution

  - title: Widely used
    icon: ability
    details: Most popular polyfill of the JavaScript. 250 million downloads per month on NPM

  - title: Easy to use
    icon: light
    details: Integration with tools like Babel and SWC

  - title: Powerful features
    icon: strong
    details: Implemented new APIs from ES5 to ongoing ECMAScript proposal
---

## Sponsors

`core-js` isn't backed by a company, so the future of this project depends on you. [Become a sponsor or a backer](./donate.md) if you are interested in `core-js`.

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

::: details more backers
[![backers](https://opencollective.com/core-js/backers.svg?width=1200)](https://opencollective.com/core-js#backers){ .no-ext-link-icon }
:::

## Examples

::: code-tabs#js
@tab basic usage

```js
//https://tinyurl.com/2mknex43
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

@tab on-demand load

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

@tab avoid global pollution

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
