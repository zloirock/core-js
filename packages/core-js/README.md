# core-js

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/zloirock/core-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![version](https://img.shields.io/npm/v/core-js.svg)](https://www.npmjs.com/package/core-js) [![npm downloads](https://img.shields.io/npm/dm/core-js.svg)](http://npm-stat.com/charts.html?package=core-js&author=&from=2014-11-18) [![Build Status](https://travis-ci.org/zloirock/core-js.svg)](https://travis-ci.org/zloirock/core-js) [![devDependency status](https://david-dm.org/zloirock/core-js/dev-status.svg)](https://david-dm.org/zloirock/core-js?type=dev)
#### As advertising: the author is looking for a good job :)

Modular standard library for JavaScript. Includes polyfills for [ECMAScript 5, 2015, 2016, 2017](#ecmascript): [promises](#ecmascript-promise), [symbols](#ecmascript-symbol), [collections](#ecmascript-collections), iterators, [typed arrays](#ecmascript-typed-arrays), many other features, [ECMAScript proposals](#ecmascript-proposals), [some cross-platform WHATWG / W3C ECMAScript-related features and proposals](#web-standards) like [setImmediate](#setimmediate). You can load only required features or use it without global namespace pollution.

[*Example*](http://goo.gl/a2xexl):
```js
import 'core-js'; // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, [2, 3], [4, [5]]].flatten(2);              // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

*You can load only required features*:
```js
import 'core-js/fn/array/from';    // <- at the top of your entry point
import 'core-js/fn/array/flatten'; // <- at the top of your entry point
import 'core-js/fn/set';           // <- at the top of your entry point
import 'core-js/fn/promise';       // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, [2, 3], [4, [5]]].flatten(2);              // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

*Or use it without global namespace pollution*:
```js
import from from 'core-js-pure/fn/array/from';
import flatten from 'core-js-pure/fn/array/flatten';
import Set from 'core-js-pure/fn/set';
import Promise from 'core-js-pure/fn/promise';

from(new Set([1, 2, 3, 2, 1]));                // => [1, 2, 3]
flatten([1, [2, 3], [4, [5]]], 2);             // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```
