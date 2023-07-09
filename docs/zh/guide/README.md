---
icon: launch
category: guide
---

# 快速上手

::: tip
Core-JS 被集成到许多构建工具中，你可以用它们快速实现 polyfill：

- [Babel](./babel.md)
- [SWC](./swc.md)

如果你确定需要手动使用 Core-JS，请继续阅读以下部分。
:::

## 安装

```sh
# 全局版本
npm install --save core-js@%COREJS_VERSION%
# 无全局命名空间污染的版本
npm install --save core-js-pure@%COREJS_VERSION%
# bundle 后的全局版本
npm install --save core-js-bundle@%COREJS_VERSION%
```

或者你可以通过 [CDN](https://www.jsdelivr.com/package/npm/core-js-bundle) 来引入 Core-JS。

### `postinstall` 信息

Core-JS 项目需要你的支持，为此会在安装后显示一条信息。如果它给你带来麻烦，你可以禁用它

```shell
ADBLOCK=true npm install
# 或
DISABLE_OPENCOLLECTIVE=true npm install
# 或
npm install --loglevel silent
```

## CommonJS API

你可以只引用你需要的 polyfill，就像首页的示例那样。CommonJS 入口点适用于所有已被 polyfill 的方法、构造函数以及命名空间。以下为一些例子：

```js
// Polyfill 包括早期提案在内的所有 Core-JS 支持的特性：
import "core-js";
// 或者
import "core-js/full";
// 或者使用 Deno
import "https://deno.land/x/corejs@v%COREJS_VERSION%/index.js";
// Polyfill 所有 actual 特性 —— ES 标准、web 标准以及 stage3 阶段的 ES 提案：
import "core-js/actual";
// 只 polyfill 稳定特性 —— ES 和 web 标准：
import "core-js/stable";
// 只 polyfill ES 标准：
import "core-js/es";

// 如果你想 polyfill `Set`:
// 所有 `Set`相关的特性，包括早期 ES 提案：
import "core-js/full/set";
// 包含 `Set` 相关的 ES 及 web 标准中的特性和处于 stage3 阶段的 ES 提案：
import "core-js/actual/set";
// 包含 `Set` 相关的 ES 标准及 web 标准中的特性（此例中为 DOM collections 迭代器）
import "core-js/stable/set";
// 只包含 ES 标准中`Set`相关的特性 :
import "core-js/es/set";
// 和以上内容等价但不污染全局命名空间的版本：
import Set from "core-js-pure/full/set";
import Set from "core-js-pure/actual/set";
import Set from "core-js-pure/stable/set";
import Set from "core-js-pure/es/set";

// 如果你只想 polyfill 几个特定的方法：
import "core-js/full/set/intersection";
import "core-js/actual/array/find-last";
import "core-js/stable/queue-microtask";
import "core-js/es/array/from";

// Polyfill iterator helpers 提案：
import "core-js/proposals/iterator-helpers";
// Polyfill 所有 stage2+ 阶段的提案：
import "core-js/stage/2";
```

:::tip
建议使用`/actual/`命名空间，因为它包括所有实际的 JavaScript 特性，不包括主要用于实验的不稳定的早期阶段的提案。
:::

### 使用 CommonJS API 时的注意事项

- `/modules/` 下的内容为内部的 API，不会注入所有需要的依赖，并且可以在次要或补丁版本中改变。只有在自定义构建或者你知道你在做什么的情况下才使用它
- 如果你使用 Core-JS 的同时扩展本地对象，建议在你的应用程序的入口点顶部加载所有 Core-JS 模块，否则可能会产生冲突
  - 例如，Google Maps 使用他们自己的`Symbol.iterator`，这与 Core-JS 的`Array.from`、`URLSearchParams`等冲突，参见 [相关 issues](https://github.com/zloirock/core-js/search?q=Google+Maps&type=Issues)
  - 这种冲突也可以通过检查并手动添加 Core-JS 中的每个冲突条目来解决
- Core-JS 是模块化的，使用了很多非常小的模块，正因为、如此，在浏览器中使用时要对 Core-JS 进行 bundle，而不是单独加载每个文件（这可能会产生数百个请求）

### 使用 CommonJS API 时的注意事项

`pure` 版本不会污染原生构造函数的 prototype。为此 prototype 上的方法会和上面的例子中一样被转为静态方法。使用转译器时，我们还可以使用一个技巧——[bind operator and virtual methods](https://github.com/tc39/proposal-bind-operator)，`/virtual/`入口点就是为此设计的。例如：

```js
import fill from "core-js-pure/actual/array/virtual/fill";
import findIndex from "core-js-pure/actual/array/virtual/find-index";

Array(10)
  ::fill(0)
  .map((a, b) => b * b)
  ::findIndex((it) => it && !(it % 8)); // => 4
```

::: warning
bind 操作符仍是一个早期 ECMAScript 提案，使用它可能带来未知风险！
:::

## 自定义 polyfill 的启用行为

默认情况下，Core-JS 只在需要时使用 polyfill。这意味着 Core-JS 会检查一个功能是否存在并能正常工作，如果未检测到问题，Core-JS 会使用原生实现。
但有时 Core-JS 的功能检测对你的情况来说可能过于严格。例如，`Promise` 构造函数需要支持未捕获异常的跟踪和`@@species`。亦或者我们可能遇到相反的问题——明知有问题的环境，却无法被 Core-JS 检测到。
对于这些情况，我们可以为某些 polyfill 重新定义此行为：

```js
const configurator = require("core-js/configurator");

configurator({
  useNative: ["Promise"], // polyfill 只会在原生功能完全不可用的情况下启用
  usePolyfill: ["Array.from", "String.prototype.padEnd"], // 永远使用 polyfill
  useFeatureDetection: ["Map", "Set"], // 默认行为
});

require("core-js/actual");
```

它对某些功能不起作用。另外，如果你改变了默认行为，也可能导致 Core-JS 内部也无法正常工作。

## 自定义构建

在某些情况下，排除一些 Core-JS 功能或为目标环境生成一个 polyfill 是很有用的。为此你可以使用 [`core-js-builder`](/packages/core-js-builder) 包
