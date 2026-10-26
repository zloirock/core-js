# core-js@3, Babel 展望未来

经过一年半的开发，数十个版本，许多不眠之夜，**[`core-js@3`](https://github.com/zloirock/core-js)** 终于发布了。这是 `core-js` 和 **[babel](https://babeljs.io/)** 补丁相关的功能的最大的一次变化。

什么是 `core-js`?

- 它是JavaScript标准库的 polyfill，它支持
  - 最新的 [ECMAScript](https://en.wikipedia.org/wiki/ECMAScript) 标准
  - ECMAScript 标准库提案
  - 一些 [WHATWG](https://en.wikipedia.org/wiki/WHATWG)  / [W3C](https://en.wikipedia.org/wiki/World_Wide_Web_Consortium) 标准（跨平台或者 ECMAScript 相关）
- 它最大限度的模块化：你能仅仅加载你想要使用的功能
- 它能够不污染全局命名空间
- 它[和babel紧密集成](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md#Babel)：这能够优化`core-js`的导入

它是最普遍、[最流行](https://npmtrends.com/airbnb-js-shims-vs-core-js-vs-es5-shim-vs-es6-shim-vs-js-polyfills-vs-polyfill-library-vs-polyfill-service) 的给 JavaScript 标准库打补丁的方式，但是有很大一部分开发者并不知道他们间接的使用了`core-js`🙂

## 贡献

`core-js` 是我自己爱好的项目，没有给我带来任何利润。它花了我很长的时间，真的很昂贵：为了完成 `core-js@3`，我在几个月之前已经离开我的工作。这个项目对许多人和公司起到了促进作用。因为这些，筹集资金去支持 `core-js` 的维护是说得通的。

如果你对 `core-js` 感兴趣或者在你每天的工作中有使用到，你可以在 [Open Collective](https://opencollective.com/core-js#sponsor) 或者 [Patreon](https://www.patreon.com/zloirock) 成为赞助者。

你可以给[我](http://zloirock.ru/)提供一个好的工作，和我现在做的相关的。

或者你可以以另一种方式贡献，你可以帮助去改进代码、测试或者文档（现在，`core-js` 的文档还很糟糕！）。

## `core-js@3` 有哪些变化？

### JavaScript 标准库中变化的内容

由于以下两个原因，这个版本包含丰富的、新的 JavaScript 补丁：

- `core-js` 只在 major（主）版本更新时才有 break changes，即使需要和提案的内容对齐。
- `core-js@2` 在一年半前已经进入功能冻结阶段了；所有新的功能只能够添加到 `core-js@3` 这个分支。

#### 稳定的 ECMAScript 功能

稳定的 ECMAScript 功能在 `core-js` 中已经几乎完全支持有很长一段时间了，除此之外，`core-js@3` 引进了一些新功能：

- 增加支持 ECMAScript 2015 引入的两个知名标志 [`@@isConcatSpreadable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/isConcatSpreadable) 和 [`@@species`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/species)，给所有使用他们的方法。
- 增加来自 ECMAScript 2018 的 [`Array.prototype.flat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) 和 [`Array.prototype.flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)（ `core-js@2` 针对 `Array.prototype.flatten` 这个老版本的提案提供了补丁）。
- 增加来自 ECMAScript 2019 的 [`Object.fromEntries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries) 方法
- 增加来自 ECMAScript 2019 的 [`Symbol.prototype.description`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/description) 访问器

一些在 ES2016-ES2019 中作为提案被接受且已经使用很长时间的功能，现在被标记为稳定：

- [`Array.prototype.includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes) 和 [`TypedArray.prototype.includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/includes) 方法（ ESMAScript 2016 ）
- [`Object.values`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values) 和 [`Object.entries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) 方法( ECMAScript 2017 )
- [`Object.getOwnPropertyDescriptors`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors) 方法 ( ECMAScript 2017 )
- [`String.prototype.padStart`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart) 和 [`String.prototype.padEnd`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd) 方法（ ECMAScript 2017 ）
- [`Promise.prototype.finally`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally) 方法（ ECMAScript 2018 ）
- [`Symbol.asyncIterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator) 知名标志（ ECMAScript 2018 ）
- [`Object.prototype.__define(Getter|Setter)__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/__defineGetter__) 和 [`Object.prototype.__lookup(Getter|Setter)__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/__lookupGetter__) 方法（ ECMAScript 2018 ）
- [`String.prototype.trim(Start|End|Left|Right)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trimStart) 方法（ ECMAScript 2019 ）

修复了针对浏览器的许多问题，例如，[Safari 12.0 `Array.prototype.reverse` bug](https://bugs.webkit.org/show_bug.cgi?id=188794) 已经被修复了。

#### ECMAScript 提案

除了上文提到的支持内容，`core-js@3` 现在还支持下面的 ECMAScript 提案：

- [`globalThis`](https://github.com/tc39/proposal-global) stage 3（ 现在是 stage 4 ）的提案 - 之前，已经有了 `global` 和 `System.global`
- [`Promise.allSettled`](https://github.com/tc39/proposal-promise-allSettled) stage 2（ 现在是 stage 4 ）提案
- [新 `Set` 方法](https://github.com/tc39/proposal-set-methods) stage 2 提案：
  - Set.prototype.difference
  - Set.prototype.intersection
  - Set.prototype.isDisjoinFrom
  - Set.prototype.isSubsetOf
  - Set.prototype.isSupersetOf
  - Set.prototype.symmetricDifference
  - Set.prototype.union
- [新 collections 方法](https://github.com/tc39/proposal-collection-methods) stage 1 提案，包函许多新的有用的方法：
  - Map.groupBy
  - Map.keyBy
  - Map.prototype.deleteAll
  - Map.prototype.every
  - Map.prototype.filter
  - Map.prototype.find
  - Map.prototype.findKey
  - Map.prototype.includes
  - Map.prototype.keyOf
  - Map.prototype.mapKeys
  - Map.prototype.mapValues
  - Map.prototype.merge
  - Map.prototype.reduce
  - Map.prototype.some
  - Map.prototype.update
  - Set.prototype.addAll
  - Set.prototype.deleteAll
  - Set.prototype.every
  - Set.prototype.filter
  - Set.prototype.find
  - Set.prototype.join
  - Set.prototype.map
  - Set.prototype.reduce
  - Set.prototype.some
  - WeakMap.prototype.deleteAll
  - WeakSet.prototype.addAll
  - WeakSet.prototype.deleteAll
- [`String.prototype.replaceAll`](https://github.com/tc39/proposal-string-replace-all) stage 1（ 现在是 stage 3 ） 提案
- [`String.prototype.codePoints`](https://github.com/tc39/proposal-string-prototype-codepoints) stage 1 提案
- [`Array.prototype.last(Item|Index)`](https://github.com/tc39-transfer/proposal-array-last) stage 1 提案
- [`compositeKey` 和 `compositeSymbol` 方法](https://github.com/bmeck/proposal-richer-keys/tree/master/compositeKey) stage 1 提案
- [`Number.fromString`](https://github.com/tc39/proposal-number-fromstring) stage 1 提案
- [`Math.seededPRNG`](https://github.com/tc39/proposal-seeded-random) stage 1 提案
- [`Promise.any` (合并的错误)](https://github.com/tc39/proposal-promise-any) stage 0（ 现在是 stage 3 ）提案

一些提案的变化很大，`core-js` 也将相应的更新：

- [`String.prototype.matchAll`](https://github.com/tc39/proposal-string-matchall) stage 3 提案
- [Observable](https://github.com/tc39/proposal-observable) stage 1 提案


#### web 标准

许多有用的功能被添加到这个类别中。

最重要的一个是 [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) 和 [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)。他是[最受欢迎的功能请求之一](https://github.com/zloirock/core-js/issues/117)。增加 `URL` 和 `URLSearchParams`，并保证他们最大限度的符合规范，保持源代码足够紧凑来支撑任何环境是 `core-js@3` 开发中[最困难的任务之一](https://github.com/zloirock/core-js/pull/454/files)。

`core-js@3` 包函在 JavaScript 中创建微任务（ microtask ）的标准方法：[`queueMicrotask`](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#microtask-queuing) 。`core-js@2` 提供了  `asap` 函数，提供了同样功能的老的提案。`queueMicrotask` 被定义在 HTML 标准中，它已经能够在现代浏览器比如 Chromium 或者 NodeJS 中使用。

另一个受欢迎的功能请求是支持 [DOM 集合的 `.forEach` 方法](https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach)。由于 `core-js` 已经针对 DOM 集合迭代器做了 polyfill，为什么不给 `节点列表` 和 [`DOMTokenList`](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMTokenList) 也增加 `.forEach` 呢？

#### 移除过时的功能：

- `Reflect.enumerate` 因为他已经从标准中移除了
- `System.global` 和 `global` 现在他们已经被 `globalThis` 代替
- `Array.prototype.flatten` 现在被 `Array.prototype.flat` 代替
- `asap` 被 `queueMicrotask` 代替
- `Error.isError` 被撤销很长时间了
- `RegExp.escape` 很久之前被拒绝了
- `Map.prototype.toJSON` 和 `Set.prototype.toJSON` 也是很久前被拒绝了
- 不必要并且被错误添加的迭代器方法：`CSSRuleList`，`MediaList`，`StyleSheetList`。

#### 不再有非标准、非提案的功能

许多年前，我开始写一个库，他是我的 JavaScript 程序的核心：这个库包函 polyfills 和一些我需要的工具函数。一段时间后，这个库以 `core-js` 命名发布。我认为现在大多数 `core-js` 用户不需要非标准的 `core-js` 功能，他们大多已经在早期版本移除了，现在是时候将剩余部分从 `core-js` 中移除。从这个版本开始，`core-js` 可以被称为  polyfill 了。

### 包、入口和模块名字

一个 issue 里提了 `core-js` 包的很大（ ~2MB ），有很多重复文件。因为这个原因，`core-js` 分成了 3 个包：
- [`core-js`](https://www.npmjs.com/package/core-js) 定义全局的 polyfills。（ ~500KB，[压缩并且 gzipped 处理后 40KB](https://bundlephobia.com/result?p=core-js@3.0.0-beta.20) ）
- [`core-js-pure`](https://www.npmjs.com/package/core-js-pure)，提供了不污染全局变量的 polyfills。它和 `core-js@2` 中的 `core-js/library` 相当。（~440KB）
- [`core-js-bundle`](https://www.npmjs.com/package/core-js-bundle)：定义了全局填充的打包版本

`core-js` 的早期版本中，稳定的 ECMAScript 功能和 ECMAScript 提案的 polyfill 模块化需要分别加 `es6.` 和 `es7.` 前缀。这是在 2014 年做的决定，那时将 ES6 之后的所有功能都视为 ES7。在 `core-js@3` 中所有稳定的 ECMAScript 功能都增加 `es.` 前缀，ECMAScript 提案增加 `esnext.` 前缀。

几乎所有的 CommonJS 入口都改变了。`core-js@3` 相比于 `core-js@2` 有更多的入口：这带来的最大限度的灵活性，使你能够仅仅引入你的应用需要的依赖。

这里是一些例子关于如何使用新的入口：

```js
// 使用 `core-js` 全部功能打补丁：
import "core-js";
// 仅仅使用稳定的 `core-js` 功能 - ES 和 web 标准：
import "core-js/stable";
// 仅仅使用稳定的 ES 功能
import "core-js/es";

// 如果你想用 `Set` 的补丁
// 所有 `Set`- ES 提案中，相关的功能：
import "core-js/features/set";
// 稳定的 `Set` ES 功能和来自web标准的功能
// （DOM 集合迭代器）
import "core-js/stable/set";
// 只有 `Set` 所需的稳定的 ES 功能
import "core-js/es/set";
// 与上面一致，但不会污染全局命名空间
import Set from "core-js-pure/features/set";
import Set from "core-js-pure/stable/set";
import Set from "core-js-pure/es/set";


// 仅仅为需要的方法打补丁
import "core-js/feature/set/intersection";
import "core-js/stable/queque-microtask";
import "core-js/es/array/from";

// 为 reflect metadata 提案打补丁
import "core-js/proposals/reflect-metadata";
// 为所有 stage 2+ 的提案打补丁
import "core-js/stage/2";
```

### 其他重要的变化

`core-js` polyfill 能够 [配置侵入等级](https://github.com/zloirock/core-js/blob/master/README.md#configurable-level-of-aggressiveness)。如果你认为有些情境 `core-js` 功能检测侵入性太强，原生实现对你来说已经足够，或者一个错误的实现没有被 `core-js` 检测到，你可以修改 `core-js` 的默认行为。

如果无法安装规范的每个细节实现某个功能，`core-js` 增加了一个 `.sham` 属性，例如，IE11中 `Symbol.sham` 是 `true`。

不再有 LiveScript! 当我开始写 `core-js` 时，我主要使用的是 [LiveScript](http://livescript.net/) ；一段时间后，我用 JavaScript 重写了全部的 polyfills 。在 `core-js@2` 中测试和帮助的工具函数仍然使用 LiveScript ：它是非常有趣的像 CoffeeScript 一样的语言，有强大的语法糖使你能够写非常紧凑的代码，但是它几乎已经死了。除此之外，它也是为 `core-js` 贡献的屏障，因为大多数 `core-js` 用户不知道这个语言。`core-js@3` 测试和工具函数使用现代 ES 语法：它将成为为 `core-js` 贡献的好时机🙂。

对于大多数用户，为了优化 `core-js` 导入，我建议使用 [babel](#Babel)。当然，有些情况下 [`core-js-builder`](http://npmjs.com/package/core-js-builder) 仍然有用。现在它支持 `target` 参数，使用带有目标引擎的[`browserslist`](https://github.com/browserslist/browserslist) 查询 - 你能够创建一个 bundle，仅仅包含目标引擎需要的 polyfills。对于这种情况，我做了 [`core-js-compat`](https://www.npmjs.com/package/core-js-compat)，更多关于它的信息，你能够从 [这篇文章的 `@babel/preset-env` 部分](#babelpreset-env)了解到。

---

这仅仅是冰山一角，更多的变化在内部。更多关于 `core-js` 变化可以在 [changelog](https://github.com/zloirock/core-js/blob/master/CHANGELOG.md#300---20190319) 中找到。

## Babel

正如上文提到的，`babel` 和 `core-js` 是紧密集成的：`babel` 提供了优化 `core-js` 优化导入的可能性。`core-js@3` 开发中很重要的一部分是改进 `core-js` 相关的 `babel` 功能（看[这个PR](https://github.com/babel/babel/pull/7646)）。这些变化在 [Babel 7.4.0](https://babeljs.io/blog/2019/03/19/7.4.0) 发布了。

### babel/polyfill

[`@babel/polyfill`](https://babeljs.io/docs/en/next/babel-polyfill.html) 是一个包裹的包，里面仅仅包含 `core-js` 稳定版的引入（在Babel 6 中也包含提案）和 `regenerator-runtime/runtime`，用来转译 generators 和 async 函数。这个包没有提供从 `core-js@2` 到 `core-js@3` 平滑升级路径：因为这个原因，决定弃用 `@babel/polyfill` 代之以分别引入需要的 `core-js` 和 `regenerator-runtime` 。

原来
```js
import "@babel/polyfill";
```

现在使用两行代替：

```js
import "core-js/stable";
import "regenerator-runtime/runtime";
```

别忘记直接安装这两个依赖！

```js
npm i --save core-js regenerator-runtime
```

### @babe/preset-env

[`@babel/preset-env`](https://babeljs.io/docs/en/next/babel-preset-env#usebuiltins) 有两种不同的模式，通过 `useBuiltIns` 选项：`entry` 和 `usage` 优化 `core-js`的导入。

Babel 7.4.0 引入了两种模式的共同更改，以及每种模式的特定的修改。

由于现在 `@babel/preset-env` 支持 `core-js@2` 和 `core-js@3`，因此 `useBuiltIns` 需要新的选项 -- `corejs`，这个选项用来定义使用 `core-js` 的版本（`corejs: 2` 或者 `corejs: 3`）。如果没有设置，`corejs: 2` 是默认值并且会有警告提示。

为了使 babel 支持将来的次要版本中引入的 `core-js` 的新功能，你可以在项目中定义明确的次要版本号。例如，你想使用 `core-js@3.1` 使用这个版本的新特性，你可以设置 `corejs` 选项为 `3.1`：`corejs: '3.1'` 或者 `corejs: {version: '3.1'}`。

`@babel/preset-env` 最重要的一个功能就是提供不同浏览器支持特性的数据来源，用来确定是否需要 `core-js` 填充某些内容。 [`caniuse`](https://caniuse.com/)，[`mdn`](https://developer.mozilla.org/en-US/) 和 [`compat-table`](http://kangax.github.io/compat-table/es6/) 是很好的教育资源，但是并不意味着他们能够作为数据源被开发者使用：只有 `compat-table` 包函好的 ES 相关数据集，它被 `@babel/preset-env` 使用，但是仍有些限制：

- 它包含的数据仅仅关于 ECMAScript 特性和提案，和 web 平台特性例如 `setImmediate` 或者 DOM 集合迭代器没有关系。所以直到现在，`@babel/preset-env` 仍然通过 `core-js` 添加全部的 web 平台特性即使他们已经支持了。
- 它不包含任何浏览器（甚至是严重的）bug 信息：例如，上文提到的在 Safari 12 中 `Array#reverse`，但是 `compat-table` 并没有将它标记为不支持。另一方面，`core-js` 已经修复了这个错误实现，但是因为 `compat-table` 关系，并不能使用它。
- 它仅包函一些基础的、简单的测试，没有检查功能在真实环境下是否可以正常工作。例如，老版本 Safari 的破坏的迭代器没有 `.next` 方法，但是 `compat-table` 表明 Safari 支持，因为它用 `typeof` 方法检测迭代器方法返回了 `"function"`。一些像 typed arrays 的功能几乎没有覆盖。

- `compat-table` 不是为了向工具提供数据而设计的。我是 `compat-table` 的维护者之一，但是[其他的维护者反对为维护这个功能](https://github.com/kangax/compat-table/pull/1312)。

因为这个原因，我创建了 [`core-js-compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat)：它提供了对于不同浏览器 `core-js` 模块的必要性数据。当使用 `core-js@3` 时，`@babel/preset-env` 将使用新的包取代 `compat-table`。[请帮助我们测试并提供缺少的引擎的数据的映射关系！](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md#how-to-update-core-js-compat-data)😊。

在 Babel 7.3 之前，`@babel/preset-env` 有一些与 polyfills 注入顺序有关的问题。从 7.4.0开始，`@babel/preset-env` 只按推荐顺序增加需要的 polyfills 。

#### `useBuiltIns: entry` with `corejs: 3`

当使用这个选项时，`@babel/preset-env` 代替直接引用 `core-js` 而是引入目标环境特定需要的模块。

在这个变化前，`@babel/preset` 仅替换 `import '@babel/polyfill'` 和 `import 'core-js'`，他们是同义词用来 polyfill 所有稳定的 JavaScript 特性。

现在 `@babel/polyfill` 弃用了，当 `corejs` 设置为 3 时 `@babel/preset-env` 不会转译他。

`core-js@3` 中等价替换 `@babel/polyfill` 是

```js
import "core-js/stable";
import "regenerator-runtime/runtime";
```

当目标浏览器是 `chrome 72` 时，上面的内容将被 `@babel/preset-env` 转换为
```js
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopaables.flat-map";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/web.immediate";
```

当目标浏览器是 `chrome 73`（它完全支持 ES2019 标准库），他将变为很少的引入：
```js
import "core-js/modules/web.immediate";
```

自从 `@babel/polyfill` 被弃用，转而使用分开的 `core-js` 和 `regenerator-runtime`，我们能够优化 `regenerator-runtime` 的导入。因为这个原因，如果目标浏览器原生支持 generators ，那么 `regenerator-runtime` 的导入将从源代码中移除。

现在，设置 `useBuiltIns: entry` 模式的 `@babel/preset-env` 编译所有能够获得的 `core-js` 入口和他们的组合。这意味着你能够自定义，通过使用不同的 `core-js` 入口，它将根据的目标环境优化。

例如，目标环境是 `chrome 72`，

```js
import "core-js/es";
import "core-js/proposals/set-methods";
import "core-js/features/set/map";
```

将被替换为

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

#### `useBuiltIns: usage` with `corejs: 3`

当使用这个选项时，`@babel/preset-env` 在每个文件的开头引入目标环境不支持、仅在当前文件中使用的 polyfills。

例如，
```js
const set = new Set([1, 2, 3]);
[1, 2, 3].includes(2);
```

当目标环境是老的浏览器例如 `ie 11`，将转换为
```js
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.set";

const set = new Set([1, 2, 3]);
[1, 2, 3].includes(2);
```

当目标是 `chrome 72` 时不需要导入，因为这个环境需要 polyfills：
```js
const set = new Set([1, 2, 3]);
[1, 2, 3].includes(2);
```

Babel 7.3 之前，`useBuiltIns: usage` 不稳定且不是足够可靠：许多 polyfills 不包函，并且添加了许多不是必须依赖的 polyfills。在 Babel 7.4 中，我尝试使它理解每种可能的使用模式。

在属性访问器、对象解构、`in` 操作符、全局对象属性访问方面，我改进了确定使用哪个 polyfills 的技术。

`@babel/preset-env` 现在注入语法特性所需的 polyfills：使用 `for-of` 时的迭代器，解构、扩展运算符和 `yield` 委托；使用动态 `import` 时的 promises，异步函数和 generators，等。

Babel 7.4 支持注入提案 polyfills。默认，`@babel/preset-env` 不会注入他们，但是你能够通过 `proposals` 标志设置：`corejs: { version: 3, proposals: true }`。

### @babel/runtime

当使用 `core-js@3` 时， [`@babel/transform-runtime`](https://babeljs.io/docs/en/next/babel-plugin-transform-runtime#corejs) 现在通过 `core-js-pure`（`core-js`的一个版本，不会污染全局变量） 注入 polyfills。

通过将 `@babel/transform-runtime` 设置 `corejs: 3` 选项和创建 `@babel/runtime-corejs3` 包，已经将 `core-js@3` 和 `@babel/runtime` 集成在一起。但是这将带来什么好处呢？

`@babel/runtime` 的一个受欢迎的 issue 是：不支持实例方法。从 `@babel/runtime-corejs3` 开始，这个问题已经解决。例如，

```js
array.includes(something);
```

将被编译为

```js
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";

_includesInstanceProperty(array).call(array, something);
```

另一个值得关注的变化是支持 ECMAScript 提案。默认情况下的，`@babel/plugin-transform-runtime` 不会为提案注入 polyfills 并使用不包含提案的入口。但是正如你在 `@babel/preset-env` 中做的那样，你可以设置 `proposals` 标志去开启：`corejs: { version: 3, proposals: true }`。

没有 `proposals` 标志，

```js
new Set([1, 2, 3, 2, 1]);
string.matchAll(/something/g);
```

将被编译为：
```js
import _Set from "@babel/runtime-corejs/core-js-stable/set";

new _Set([1, 2, 3, 2, 1]);
string.matchAll(/something/g);
```

当设置 `proposals` 后，将变为：

```js
import _Set from "@babel/runtime-corejs3/core-js/set";
import _matchAllInstanceProperty from "@babel/runtime-corejs/core-js/instance/match-all";

new _Set([1, 2, 3, 2, 1]);
_matchAllInstanceProperty(string).call(string, /something/g);
```

有些老的问题已经被修复了。例如，下面这种流行的模式在 `@babel/runtime-corejs2` 不工作，但是在 `@babel/runtime-corejs3` 被支持。

```js
myArrayLikeObject[Symbol.iterator] = Array.prototype[Symbol.iterator];
```

尽管 `@babel/runtime` 早期版本不支持实例方法，但是使用一些自定义的帮助函数能够支持迭代（`[Symbol.iterator]()` 和他的presence）。之前不支持提取 `[Symbol.iterator]` 方法，但是现在支持了。

作为意外收获，`@babel/runtime` 现在支持IE8-，但是有些限制，例如，IE8- 不支持访问器、模块转换应该用松散的方式，`regenerator-runtime`（内部使用 ES5+ 实现）需要通过这个插件转译。

## 畅享未来

做了许多工作，但是 `core-js` 距离完美还很远。这个库和工具将来应该如何改进？语言的变化将会如何影响它？

### 老的引擎支持

现在，`core-js` 试图去支持所有可能的引擎或者我们能够测试到的平台：甚至是IE8-，或者例如，早期版本的 Firefox。虽然它对某些用户有用，但是仅有一小部分使用 `core-js` 的开发者需要它。对于大多数用户，它将引起像包体积过大或者执行缓慢的问题。

主要的问题源自于支持 ES3 引擎（首先是 IE8- ）：多数现代 ES 特性是基于 ES5，这些功能在老版本浏览器中均不可用。

最大的缺失特性是属性描述符：当它缺失时，一些功能不能 polyfill，因为他们要么是访问器（像 `RegExp.prototype.flags` 或 `URL` 属性的 setters ）要么就是基于访问器（像 typed array polyfill）。为了解决这个不足，我们需要使用不同的解决方法（例如，保持 `Set.prototype.size` 更新）。维护这些解决方法有时很痛苦，移除他们将极大的简化许多 polyfills。

然而，描述符仅仅是问题的一部分。ES5 标准库包含了很多其他特性，他们被认为是现代 JavaScript 的基础：`Object.create`，`Object.getPrototypeOf`，`Array.prototype.forEach`，`Function.prototype.bind`，等等。和多数现代特性不同，`core-js` 内部依赖他们并且[为了实现一个简单的现代函数，`core-js` 需要加载其中一些"建筑模块"的实现](https://github.com/babel/babel/pull/7646#discussion_r179333093)。对于想要创建一个足够小的构建包和仅仅想要引入部分 `core-js` 的用户来说，这是个问题。

在一些国家 IE8 仍很流行，但是为了让 web 向前发展，浏览器到了某些时候就应该消失了。 `IE8` 在 2009 年 3 月 19 日发布，到今天已经 10 年了。IE6 已经 18 岁了：几个月前新版的 `core-js` 已经不再测试 IE6 了。

在 `core-js@4` 我们应该舍弃 IE8- 和其他不知道 ES5 的引擎。

### ECMAScript 模块

`core-js` 使用 `CommonJS` 模块规范。长期以来，他是最受欢迎的 JavaScript 模块规范，但是现在 ECMAScript 提供了他自己的模块规范。许多引擎已经支持它了。一些构建工具（像 rollup ）基于它，其他的构建工具提供它作为 `CommonJS` 的替代。这意味提供了一个可选择的使用 ESMAScript 模块规范版本的 `core-js` 行得通。

### 支持 web 标准扩展？

 `core-js` 当前专注在 ECMAScript 支持，但是也支持少量的跨平台以及和 ECMAScript 紧密联系的 web 标准功能。为 web 标准添加像 `fetch` 的这种的 polyfill 是受欢迎的功能请求。

 `core-js` 没有增加他们的主要原因是，他们将严重的增加构建包大小并且将强制 `core-js` 用户载入他们可能用不到的功能。现在 `core-js` 是最大限度的模块化，用户能够仅选择他们需要的功能，这就像 `@babel/preset-env` 和 `@babel/runtime` 能够帮助用户去减少没用到和不必要的 polyfills。

现在是时候重新审视这个决定了？

### 针对目标环境的 `@babel/runtime`

目前，我们不能像对 `@babel/preset-env` 那样为 `@babel/runtime` 设置目标加环境。这意味即使目标是现代浏览器， `@babel/runtime` 也将注所有可能的 polyfills：这不必要的增加了最终构建包的大小。

现在 `core-js-compat` 包函全部必要数据，将来，可以在 `@babel/runtime` 中添加对目标环境的编译支持，并且在 `@babel/preset-env` 中添加 `useBuiltIns: runtime` 选项。

### 更好的优化 polyfill 加载

正如上面解释的，Babel 插件给了我们不同的方式去优化 `core-js` 的使用，但是他并不完美：我们可以改进他们。

通过 `useBuiltIns: usage` 选项，`@babe/preset-env` 能够做的比之前更好，但是针对一些不寻常的例子他们仍然会失败：当代码不能被静态分析。针对这个问题，我们需要为库开发者寻找一个方式去确定哪种 polyfill 是他们的库需要的，而不是直接载入他们：某种元数据 -- 将在创建最终构建包时注入 polyfill。

另一个针对 `useBuiltIns: usage` 的问题是重复的 polyfills 导入。`useBuiltIns: usage` 能够在每个文件中注入许多 `core-js` 的导入。但如果我们的项目有数千个文件或者即使十分之一会怎么样呢？这种情况下，与导入 `core-js` 自身相比，导入 `core-js/...` 将有更多代码行：我们需要一种方式去收集所有的导入到一个文件中，这样才能够删除重复的。

几乎每一个需要支持像 `IE11` 浏览器的 `@babel/preset-env` 用户都为每个浏览器使用同一个构建包。这意味着完全支持 ES2019 的现代浏览器将加载不必要的、仅仅是 IE11 需要的 polyfills。当然，我们可以为不同的浏览器创建不同的构建包来使用，例如，`type=module` /
`nomodules` 属性：一个构建包给支持模块化的现代浏览器，另一个给传统浏览器。不幸的是，这不是针对这个问题的完整的解决方案：基于用户代理打包目标浏览器需要的 polyfill 的服务非常有用。我们已经有了一个 - [`polyfill-service`](https://github.com/Financial-Times/polyfill-service)。尽管很有趣也很流行，但是 polyfill 的质量还有很多不足。它不像几年前那么差：项目团队积极工作去改变它，但是如果你想用他们匹配原生实现，我不建议你通过这个项目使用 polyfill。许多年前我尝试通过这个项目将 `core-js` 作为 polyfill 的源，但是这不可能。因为 `polyfill-service` 依赖文件嵌套而不是模块化（就像 `core-js` 发布后的前几个月 😊）。

像这样一个集成了一个很棒的 polyfill 源 -- `core-js` 的服务，通过像 Babel 的 `useBuiltIns: usage` 选项，静态分析源代码真的能够引起我们对于 polyfill 思考方式的革命。

### 来自 TC39 的新功能预案和 `core-js` 可能的问题

TC39 一直在努力工作去改进 ECMAScript：你可以通过查看 `core-js` 中实现所有新提案查看进度。然而，我认为有些新的提案功能在 polyfill 或者转译时可能引起严重的问题。关于这个足够可以写一篇新的文章，但是我将尝试在这总结一下我的想法。

#### 标准库提案，stage 1

现在，TC39 考虑给 ECMAScript 增加[内置模块](https://github.com/tc39/proposal-javascript-standard-library)：一个模块化的标准库。它将成为 JavaScript 的最佳补充，而 `core-js` 是它可以被 polyfill 的最佳位置。根据 `@babel/preset-env` 和 `@babel/runtime` 用到的技术，理论上我们可以通过一种简单的方式注入内置模块需要的 polyfill。然而，这个提案的当前版本会导致一些严重问题，这些问题并没有使其简单明了。

内置模块的 polyfill，[根据作者的提案](https://github.com/tc39/proposal-javascript-standard-library/issues/2)，仅仅意味着退回到分层 API 或者 导入 maps。这表明如果原生模块缺失，它将能够通过提供的 url 载入一个polyfill。这绝对不是 polyfill 需要的，并且它与 `core-js` 的架构以及其他流行的 polyfill 都不兼容。导入 maps 不应该是 polyfill 内置模块的唯一方式。

我们通过一个特定前缀使用 ES 模块语法就能够得到内置模块。这个语法在语言的早期版本并没有对等的 - 转译模块不可能在现在浏览器中与未转译的交互 - 这会导致包分发的问题。

更进一步讲，他将异步工作。对于功能检测这是个严重的问题 - 当你要检测一个功能并且加载 polyfill 时脚本不会等待 - 功能检测应该同步的做。

[在没有转译和 polyfill 的情况下第一次实现内置模块](https://developers.google.com/web/updates/2019/03/kv-storage)。如果没有修改，在当前的 `core-js` 格式下内置模块将不可能 polyfill。建议的 polyfill 方式将使开发变得严重复杂。

这个标准库的问题能够通过添加一个新的全局变量解决（这将是最后一个吗？）：一个内置模块的注册表将允许异步的设置和获取，例如：

```js
StandardLibraryRegistry.get(moduleName);
StandardLibraryRegistry.set(moduleName, value);
```
异步回调，比如分层API应该全局注册表之后使用。

值得一提的是，它将简化将本地模块导入到老的语法的转换。

#### 装饰器提案，新的迭代器语法，stage 2

这个提案中的 [新迭代器](https://github.com/tc39/proposal-decorators)，他被很认真的重做了。装饰器定义不再是语法糖，就像内置模块，我们不能在老版本的语言中编写装饰器并将其用作原生装饰器。除此之外，装饰器不仅仅是普通的标识符 - 他们生活在平行的词汇范围内：这意味着已经编译的装饰器不能和原生装饰器交互。

提案作者建议使用未编译的装饰器发布包，让包的使用者选择去编译他们的依赖。然而，在不同的情况下是不可能的。当他们被添加到 JS 标准库时，这个方法将阻止 `core-js` polyfill 新的内置装饰器。

装饰器应该是在某些东西上应用功能的一种方法，他们应该仅仅是包裹的语法糖。为什么要复杂化呢？

---

如果引入的一个语言功能不是从根本上是新的，在语言的早期版本什么不应该实现是可以选择的，我们能够转译或者 polyfill 它，被转译或者 polyfill 的代码应该能够和支持这个功能的浏览器原生交互。

我希望根据提案作者和委员会的智慧，这些提案能够被采纳，这样才能够合理的转译或者 polyfill 他们。

---

如果你对 `core-js` 项目感兴趣，或者你在你日常工作中使用它，你可以成为 [OpenCollective](https://opencollective.com/core-js#sponsor) 或者 [Patreon](https://www.patreon.com/zloirock) 捐赠者。`core-js` 的背后不是一个公司：他的将来要靠你。

---

[这里](https://github.com/zloirock/core-js/discussions/963) 可以评论这篇文章。

[Denis Pushkarev](https://github.com/zloirock)，2019年3月19日，感谢 [Nicolò Ribaudo](https://github.com/nicolo-ribaudo) 编辑。
