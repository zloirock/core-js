---
icon: light
category: guide
---

# Babel Integration

Core-JS is integrated with `babel` and is the base for polyfilling-related `babel` features:

## `@babel/polyfill`

[`@babel/polyfill`](https://babeljs.io/docs/usage/polyfill) [**IS** just the import of stable Core-JS features and `regenerator-runtime`](https://github.com/babel/babel/blob/c8bb4500326700e7dc68ce8c4b90b6482c48d82f/packages/babel-polyfill/src/index.js) for generators and async functions, so if you load `@babel/polyfill` - you load the global version of Core-JS without ES proposals.

Now it's deprecated in favour of separate inclusion of required parts of Core-JS and `regenerator-runtime` and, for preventing breaking changes, left on `core-js@2`.

As a full equal of `@babel/polyfill`, you can use this:

```js
import "core-js/stable";
import "regenerator-runtime/runtime";
```

## `@babel/preset-env`

[`@babel/preset-env`](https://github.com/babel/babel/tree/master/packages/babel-preset-env) has `useBuiltIns` option, which optimizes working with global version of Core-JS. With `useBuiltIns` option, you should also set `corejs` option to used version of Core-JS, like `corejs: '3.25'`.

::: warning
Recommended to specify used minor Core-JS version, like `corejs: '3.25'`, instead of `corejs: 3`, since with `corejs: 3` will not be injected modules which were added in minor Core-JS releases.
:::

- `useBuiltIns: 'entry'` replaces imports of Core-JS to import only required for a target environment modules. So, for example,

```js
import "core-js/stable";
```

with `chrome 71` target will be replaced just to:

```js
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/web.immediate";
```

It works for all entry points of global version of Core-JS and their combinations, for example for

```js
import "core-js/es";
import "core-js/proposals/set-methods";
import "core-js/full/set/map";
```

with `chrome 71` target you will have as a result:

```js
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/esnext.set.difference";
import "core-js/modules/esnext.set.intersection";
import "core-js/modules/esnext.set.is-disjoint-from";
import "core-js/modules/esnext.set.is-subset-of";
import "core-js/modules/esnext.set.is-superset-of";
import "core-js/modules/esnext.set.map";
import "core-js/modules/esnext.set.symmetric-difference";
import "core-js/modules/esnext.set.union";
```

- `useBuiltIns: 'usage'` adds to the top of each file import of polyfills for features used in this file and not supported by target environments, so for:

```js
// first file:
var set = new Set([1, 2, 3]);

// second file:
var array = Array.of(1, 2, 3);
```

if target contains an old environment like `IE 11` we will have something like:

```js
// first file:
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.set";
var set = new Set([1, 2, 3]);

// second file:
import "core-js/modules/es.array.of";
var array = Array.of(1, 2, 3);
```

By default, `@babel/preset-env` with `useBuiltIns: 'usage'` option only polyfills stable features, but you can enable polyfilling of proposals by `proposals` option, as `corejs: { version: '3.25', proposals: true }`.

::: warning
In the case of `useBuiltIns: 'usage'`, you should not add Core-JS imports by yourself, they will be added automatically.
:::

## `@babel/runtime`

[`@babel/runtime`](https://babeljs.io/docs/plugins/transform-runtime/) with `corejs: 3` option simplifies work with `core-js-pure`. It automatically replaces usage of modern features from JS standard library to imports from the version of Core-JS without global namespace pollution, so instead of:

```js
import from from "core-js-pure/stable/array/from";
import flat from "core-js-pure/stable/array/flat";
import Set from "core-js-pure/stable/set";
import Promise from "core-js-pure/stable/promise";

from(new Set([1, 2, 3, 2, 1]));
flat([1, [2, 3], [4, [5]]], 2);
Promise.resolve(32).then((x) => console.log(x));
```

you can write just:

```js
Array.from(new Set([1, 2, 3, 2, 1]));
[1, [2, 3], [4, [5]]].flat(2);
Promise.resolve(32).then((x) => console.log(x));
```

By default, `@babel/runtime` only polyfills stable features, but like in `@babel/preset-env`, you can enable polyfilling of proposals by `proposals` option, as `corejs: { version: 3, proposals: true }`.

::: warning
If you use `@babel/preset-env` and `@babel/runtime` together, use `corejs` option only in one place since it's duplicate functionality and will cause conflicts.
:::
