---
icon: light
category: guide
tag:
  - untranslated
---

# Babel 集成

`core-js`被集成到 `babel` 中，也是`babel` polyfill 相关功能的基础。

## `@babel/polyfill`

[`@babel/polyfill`](https://babeljs.io/docs/usage/polyfill) [**只**导入`core-js` 中正式版的功能和 `regenerator-runtime` ](https://github.com/babel/babel/blob/c8bb4500326700e7dc68ce8c4b90b6482c48d82f/packages/babel-polyfill/src/index.js) 用于 Generator 和异步函数，所以使用`@babel/polyfill`就相当于导入了全局版本的`core-js`（不包括 ES 提案）

目前此 package 已经废弃，并为了包含`core-js`和`regenerator-runtime`所需的部分，以及防止兼容性问题，此 package 仍停留在`core-js@2`上。

你可以使用下面这段代码的作为`@babel/polyfill`等价替代品：

```js
import "core-js/stable";
import "regenerator-runtime/runtime";
```

## `@babel/preset-env`

[`@babel/preset-env`](https://github.com/babel/babel/tree/master/packages/babel-preset-env) 有一个 `useBuiltIns` 选项, which optimizes working with global version of `core-js`。使用 `useBuiltIns` 的时候，你应该同时设置选项 `corejs` 来指定要使用的 `core-js`版本（例如`corejs: '3.25'`）。

:::warning
建议指定 `core-js` 的次要版本（如 `corejs: '3.25'` 而不是 `corejs: 3`），因为 `corejs: 3` 并不会包含次要版本中添加的 API
:::

- `useBuiltIns: 'entry'` replaces imports of `core-js` to import only required for a target environment modules. So, for example,

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

It works for all entry points of global version of `core-js` and their combinations, for example for

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

:::waring Warning
In the case of `useBuiltIns: 'usage'`, you should not add `core-js` imports by yourself, they will be added automatically.
:::

## `@babel/runtime`

[`@babel/runtime`](https://babeljs.io/docs/plugins/transform-runtime/) with `corejs: 3` option simplifies work with `core-js-pure`. It automatically replaces usage of modern features from JS standard library to imports from the version of `core-js` without global namespace pollution, so instead of:

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

::: warn
If you use `@babel/preset-env` and `@babel/runtime` together, use `corejs` option only in one place since it's duplicate functionality and will cause conflicts.
:::
