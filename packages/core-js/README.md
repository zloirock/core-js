# core-js

Modular standard library for JavaScript. Includes polyfills for [ECMAScript 5, 2015, 2016, 2017](https://github.com/zloirock/core-js#ecmascript): [promises](https://github.com/zloirock/core-js#ecmascript-promise), [symbols](https://github.com/zloirock/core-js#ecmascript-symbol), [collections](https://github.com/zloirock/core-js#ecmascript-collections), iterators, [typed arrays](https://github.com/zloirock/core-js#ecmascript-typed-arrays), many other features, [ECMAScript proposals](https://github.com/zloirock/core-js#ecmascript-proposals), [some cross-platform WHATWG / W3C ECMAScript-related features and proposals](https://github.com/zloirock/core-js#web-standards) like [setImmediate](https://github.com/zloirock/core-js#setimmediate). You can load only required features or use it without global namespace pollution.

[*Example*](http://goo.gl/a2xexl):
```js
import 'core-js'; // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, [2, 3], [4, [5]]].flatten(2);              // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

*You can load only required features*:
```js
import 'core-js/features/array/from';    // <- at the top of your entry point
import 'core-js/features/array/flatten'; // <- at the top of your entry point
import 'core-js/features/set';           // <- at the top of your entry point
import 'core-js/features/promise';       // <- at the top of your entry point

Array.from(new Set([1, 2, 3, 2, 1]));          // => [1, 2, 3]
[1, [2, 3], [4, [5]]].flatten(2);              // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

*Or use it without global namespace pollution*:
```js
import from from 'core-js-pure/features/array/from';
import flatten from 'core-js-pure/features/array/flatten';
import Set from 'core-js-pure/features/set';
import Promise from 'core-js-pure/features/promise';

from(new Set([1, 2, 3, 2, 1]));                // => [1, 2, 3]
flatten([1, [2, 3], [4, [5]]], 2);             // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```

**It's a global version (first 2 examples), for more info see [`core-js` documentation](https://github.com/zloirock/core-js/blob/v3/README.md).**
