![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![core-js downloads](https://img.shields.io/npm/dm/core-js.svg?label=npm%20i%20core-js)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![core-js-pure downloads](https://img.shields.io/npm/dm/core-js-pure.svg?label=npm%20i%20core-js-pure)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![jsDelivr](https://data.jsdelivr.com/v1/package/npm/core-js-bundle/badge?style=rounded)](https://www.jsdelivr.com/package/npm/core-js-bundle)

</div>

## **I highly recommend reading this: [So, what's next?](https://corejs-doc.netlify.app/blog/2023/so-whats-next.html)**

> Modular standard library for JavaScript. Includes polyfills for [ECMAScript up to 2023](https://corejs-doc.netlify.app/features/es-standard/): [promises](https://corejs-doc.netlify.app/features/es-standard/promise.html), [symbols](https://corejs-doc.netlify.app/features/es-standard/symbol.html), [collections](https://corejs-doc.netlify.app/features/es-standard/collections.html), iterators, [typed arrays](https://corejs-doc.netlify.app/features/es-standard/typed-array.html), many other features, [ECMAScript proposals](https://corejs-doc.netlify.app/features/es-proposal/), [some cross-platform WHATWG / W3C features and proposals](https://corejs-doc.netlify.app/features/web-standard/) like [`URL`](https://corejs-doc.netlify.app/features/web-standard/url.html). You can load only required features or use it without global namespace pollution.

**If you are looking for documentation for obsolete `core-js@2`, please, check [this branch](https://github.com/zloirock/core-js/tree/v2).**

## [core-js@3, babel and a look into the future](https://corejs-doc.netlify.app/blog/2019/core-js-3-babel-and-a-look-into-the-future.html)

## Raising funds

`core-js` isn't backed by a company, so the future of this project depends on you. Become a sponsor or a backer if you are interested in `core-js`: - Open Collective:

- Open Collective:

  [![Open-collective-buttom](https://opencollective.com/core-js/donate/button@2x.png?color=blue)](https://opencollective.com/core-js/donate)

- [Patreon](https://patreon.com/zloirock)
- [Boosty](https://boosty.to/zloirock)
- Bitcoin:
  `bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz`
- Alipay:

  ![Alipay-code](./docs/.vuepress/public/sponsor/alipay.jpg)

### Sponsors

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

[![backers](https://opencollective.com/core-js/backers.svg?width=1200)](https://opencollective.com/core-js#backers){ .no-ext-link-icon }

## Quick start

[_Example of usage_](https://tinyurl.com/2mknex43):

```js
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

_You can load only required features_:

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

_Or use it without global namespace pollution_:

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

## Docs

[Core-JS Document](https://corejs-doc.netlify.app/)
