![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/v4/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/@core-js/bundle.svg)](https://www.npmjs.com/package/@core-js/bundle)

</div>

**I highly recommend reading this: [So, what's next?](https://github.com/zloirock/core-js/blob/v4/docs/2023-02-14-so-whats-next.md)**
---

> [`core-js`](https://core-js.io) is a modular standard library for JavaScript. Includes polyfills for ECMAScript up to 2026: [promises](https://core-js.io/v4/docs/features/ecmascript/promise), [symbols](https://core-js.io/v4/docs/features/ecmascript/symbol), [collections](https://core-js.io/v4/docs/features/ecmascript/collections), [iterators](https://core-js.io/v4/docs/features/ecmascript/iterator), [typed arrays](https://core-js.io/v4/docs/features/ecmascript/typed-arrays), many other features, ECMAScript proposals, some cross-platform WHATWG / W3C features and proposals like [`URL`](https://core-js.io/v4/docs/features/web-standards/url). You can load only required features or use it without global namespace pollution.

## Raising funds

`core-js` isn't backed by a company, so the future of this project depends on you. Become a sponsor or a backer if you are interested in `core-js`: [**Open Collective**](https://opencollective.com/core-js), [**Patreon**](https://patreon.com/zloirock), [**Boosty**](https://boosty.to/zloirock), **Bitcoin ( bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz )**, [**Alipay**](https://user-images.githubusercontent.com/2213682/219464783-c17ad329-17ce-4795-82a7-f609493345ed.png).

---

<a href="https://opencollective.com/core-js/sponsor/0/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/0/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/1/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/1/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/2/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/2/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/3/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/3/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/4/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/4/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/5/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/5/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/6/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/6/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/7/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/7/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/8/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/8/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/9/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/9/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/10/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/10/avatar.svg"></a><a href="https://opencollective.com/core-js/sponsor/11/website" target="_blank"><img src="https://opencollective.com/core-js/sponsor/11/avatar.svg"></a>

---

<a href="https://opencollective.com/core-js#backers" target="_blank"><img src="https://opencollective.com/core-js/backers.svg?width=890"></a>

---

[*Example of usage*](https://core-js.io/v4/playground#code=Promise.try%28%28%29+%3D%3E+42%29.then%28it+%3D%3E+console.log%28it%29%29%3B+%2F%2F+-%3E+42%0A%0AArray.from%28new+Set%28%5B1%2C+2%2C+3%5D%29.union%28new+Set%28%5B3%2C+4%2C+5%5D%29%29%29%3B+%2F%2F+%3D%3E+%5B1%2C+2%2C+3%2C+4%2C+5%5D%0A%0A%5B1%2C+2%5D.flatMap%28it+%3D%3E+%5Bit%2C+it%5D%29%3B+%2F%2F+%3D%3E+%5B1%2C+1%2C+2%2C+2%5D%0A%0AIterator.concat%28%5B1%2C+2%5D%2C+function+%2A+%28i%29+%7B+while+%28true%29+yield+i%2B%2B%3B+%7D%283%29%29%0A++.drop%281%29.take%285%29%0A++.filter%28it+%3D%3E+it+%25+2%29%0A++.map%28it+%3D%3E+it+%2A%2A+2%29%0A++.toArray%28%29%3B+%2F%2F+%3D%3E+%5B9%2C+25%5D%0A%0AstructuredClone%28new+Set%28%5B1%2C+2%2C+3%5D%29%29%3B+%2F%2F+%3D%3E+Set+%7B+1%2C+2%2C+3+%7D):
```html
<script src="node_modules/@core-js/bundle/minified.js"></script>
<script>
  Promise.try(() => 42).then(it => console.log(it)); // -> 42

  Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]

  [1, 2].flatMap(it => [it, it]); // => [1, 1, 2, 2]

  Iterator.concat([1, 2], function * (i) { while (true) yield i++; }(3))
    .drop(1).take(5)
    .filter(it => it % 2)
    .map(it => it ** 2)
    .toArray(); // => [9, 25]

  structuredClone(new Set([1, 2, 3])); // => Set { 1, 2, 3 }
</script>
```

*With a bundler or in Node.js, it's enough to import the package*:
```js
import '@core-js/bundle';
```

**It's a bundled global version, for more info see [`core-js` documentation](https://core-js.io).**
