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

## Examples

::: code-tabs#js
@tab basic usage
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

@tab on-demand load
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

@tab avoid global pollution
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