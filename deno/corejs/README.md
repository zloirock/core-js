![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![core-js downloads](https://img.shields.io/npm/dm/core-js.svg?label=npm%20i%20core-js)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![core-js-pure downloads](https://img.shields.io/npm/dm/core-js-pure.svg?label=npm%20i%20core-js-pure)](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-compat&from=2014-11-18) [![jsDelivr](https://data.jsdelivr.com/v1/package/npm/core-js-bundle/badge?style=rounded)](https://www.jsdelivr.com/package/npm/core-js-bundle)

</div>

**I highly recommend reading this: [So, what's next?](https://github.com/zloirock/core-js/blob/master/docs/2023-02-14-so-whats-next.md)**
---

> Modular standard library for JavaScript. Includes polyfills for [ECMAScript up to 2021](https://github.com/zloirock/core-js#ecmascript): [promises](https://github.com/zloirock/core-js#ecmascript-promise), [symbols](https://github.com/zloirock/core-js#ecmascript-symbol), [collections](https://github.com/zloirock/core-js#ecmascript-collections), iterators, [typed arrays](https://github.com/zloirock/core-js#ecmascript-typed-arrays), many other features, [ECMAScript proposals](https://github.com/zloirock/core-js#ecmascript-proposals), [some cross-platform WHATWG / W3C features and proposals](#web-standards) like [`URL`](https://github.com/zloirock/core-js#url-and-urlsearchparams). You can load only required features or use it without global namespace pollution.

## [core-js@3, babel and a look into the future](https://github.com/zloirock/core-js/tree/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)

## Raising funds

`core-js` isn't backed by a company, so the future of this project depends on you. Become a sponsor or a backer if you are interested in `core-js`: [**Open Collective**](https://opencollective.com/core-js), [**Patreon**](https://patreon.com/zloirock), [**Boosty**](https://boosty.to/zloirock), **Bitcoin ( bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz )**, [**Alipay**](https://user-images.githubusercontent.com/2213682/219464783-c17ad329-17ce-4795-82a7-f609493345ed.png).

---

<a href="https://opencollective.com/core-js/sponsor/0/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/0/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/1/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/1/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/2/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/2/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/3/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/3/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/4/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/4/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/5/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/5/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/6/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/6/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/7/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/7/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/8/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/8/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/9/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/9/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/10/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/10/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/11/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/11/avatar.svg"></a>

---

<a href="https://opencollective.com/core-js#backers" target="_blank"><img src="https://opencollective.com/core-js/backers.svg?width=890"></a>

---

*Example*:
```js
import 'https://deno.land/x/corejs@v3.36.1/index.js'; // <- at the top of your entry point

Object.hasOwn({ foo: 42 }, 'foo');   // => true

[1, 2, 3, 4, 5, 6, 7].at(-3);        // => 5

[1, 2, 3, 4, 5].group(it => it % 2); // => { 1: [1, 3, 5], 0: [2, 4] }

Promise.any([
  Promise.resolve(1),
  Promise.reject(2),
  Promise.resolve(3),
]).then(console.log);                // => 1

(function * (i) { while (true) yield i++; })(1)
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray();                        // => [9, 25]
```

**It's a bundled global version for Deno 1.0+, for more info see [`core-js` documentation](https://github.com/zloirock/core-js/blob/master/README.md).**
