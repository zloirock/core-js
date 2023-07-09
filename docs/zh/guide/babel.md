---
icon: light
category: guide
---

# Babel 集成

`babel` 集成了 Core-JS，Core-JS 也是 `babel` polyfill 相关功能的基础。

## `@babel/polyfill`

[`@babel/polyfill`](https://babeljs.io/docs/usage/polyfill) [**只是**对 Core-JS 的稳定功能和 `regenerator-runtime` 的导入](https://github.com/babel/babel/blob/c8bb4500326700e7dc68ce8c4b90b6482c48d82f/packages/babel-polyfill/src/index.js)，用于支持生成器和异步函数，所以使用`@babel/polyfill`就相当于导入了全局版本的 Core-JS（不包括 ES 提案）

目前此 package 已经废弃，并为了包含 Core-JS 和`regenerator-runtime`所需的部分，以及防止兼容性问题，此 package 仍停留在`core-js@2`上。

下面这段代码可以完全替代 `@babel/polyfill`：

```js
import "core-js/stable";
import "regenerator-runtime/runtime";
```

## `@babel/preset-env`

在使用全局版本的 Core-JS 时可以设置[`@babel/preset-env`](https://github.com/babel/babel/tree/master/packages/babel-preset-env) 的 `useBuiltIns` 选项进行优化。使用时也请同时设置 `corejs` 选项来指定 Core-JS 版本（例如 `corejs: '3.25'`）。

::: warning
建议指定 Core-JS 的次要版本（如 `corejs: '3.25'` 而不是 `corejs: 3`），因为 `corejs: 3`会被解析为 `corejs: 3.0` 因而不包含次要版本中添加的功能
:::

- `useBuiltIns: 'entry'` 只导入 Core-JS 中目标环境需要的模块，例如：

```js
import "core-js/stable";
```

当目标环境为 `chrome 71` 时，将会被替换为：

```js
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/web.immediate";
```

这适用于所有全局版本的 Core-JS 入口点以及它们的组合，例如：

```js
import "core-js/es";
import "core-js/proposals/set-methods";
import "core-js/full/set/map";
```

当目标环境为 `chrome 71` 时，结果是：

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

- 对于使用到但目标环境不支持的特性，`useBuiltIns: 'usage'` 会在每个文件顶部导入针对它们的 polyfill，所以对于：

```js
// 第一个文件:
var set = new Set([1, 2, 3]);

// 第二个文件:
var array = Array.of(1, 2, 3);
```

当目标环境包含了一个古老的环境（如 `IE 11`）时，会输出：

```js
// 第一个文件:
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.set";
var set = new Set([1, 2, 3]);

// 第二个文件:
import "core-js/modules/es.array.of";
var array = Array.of(1, 2, 3);
```

默认情况下，当 `@babel/preset-env` 与 `useBuiltIns: 'usage'` 配合使用时，只会对正式标准中的特性进行 polyfill。但你可以通过 `proposals` 选项启用对 ES 提案的 polyfill，如 `corejs: { version: '3.25', proposals: true }`。

::: warning
当使用 `useBuiltIns: 'usage'`时不用手动导入 Core-JS，它们会自动按需导入。
:::

## `@babel/runtime`

[`@babel/runtime`](https://babeljs.io/docs/plugins/transform-runtime/) 的 `corejs: 3` 大大简化了对 `core-js-pure` 的使用。它会把代码中的现代 ES 特性自动替换成 Core-JS 提供的版本，并且不会污染全局命名空间，所以对于

```js
import from from "core-js-pure/stable/array/from";
import flat from "core-js-pure/stable/array/flat";
import Set from "core-js-pure/stable/set";
import Promise from "core-js-pure/stable/promise";

from(new Set([1, 2, 3, 2, 1]));
flat([1, [2, 3], [4, [5]]], 2);
Promise.resolve(32).then((x) => console.log(x));
```

你只需要写成：

```js
Array.from(new Set([1, 2, 3, 2, 1]));
[1, [2, 3], [4, [5]]].flat(2);
Promise.resolve(32).then((x) => console.log(x));
```

默认情况下， `@babel/runtime` 只会对正式标准中的特性进行 polyfill。但类似于 `@babel/preset-env`, 你可以通过 `proposals` 选项启用对 ES 提案的 polyfill，如 `corejs: { version: 3, proposals: true }`。

::: warning
如果你同时使用`@babel/preset-env`和`@babel/runtime`，请只在一个地方使用`corejs`选项，因为它们的作用是重复的，会引起冲突
:::
