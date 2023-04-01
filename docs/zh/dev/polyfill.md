---
category: development
icon: code
---

# 添加新的 polyfill

- polyfill 的实现必须被添加到 [`packages/core-js/modules`](./packages/core-js/modules) 目录中。
- 共享的工具函数必须必须被添加到 [`packages/core-js/internals`](./packages/core-js/internals) 目录中。请重用已有的工具函数。
- 通常情况下使用 `internals/export` 工具函数导出 polyfill。只在这个工具函数不适用的情况下使用别的方法——比如你想要对 accessor 进行 polyfill。
- For export the polyfill, in all common cases use `internals/export` helper. Use something else only if this helper is not applicable - for example, if you want to polyfill accessors.
- 如果纯净版本实现的代码确实与全局版本有显着差异（_这并不常见，大多数情况下下使用 `internals/is-pure` 就足够了_），你可以把它添加到 [`packages/core-js-pure/override`](./packages/core-js-pure/override) 目录中。`core-js-pure` 里其余的部分会从 `core-js` 包中复制。
- 添加 polyfill 的功能检测到 [`tests/compat/tests.js`](https://github.com/zloirock/core-js/blob/master/tests/compat/tests.js) 中，添加兼容性数据到 [`packages/core-js-compat/src/data.mjs`](https://github.com/zloirock/core-js/blob/master/packages/core-js-compat/src/data.mjs) 中，方法[见这里](./compat.md)，添加 polyfill 模块的名字到 [`packages/core-js-compat/src/modules-by-versions.mjs`](https://github.com/zloirock/core-js/blob/master/packages/core-js-compat/src/modules-by-versions.mjs)（该数据再打包和生成索引时也被用于获取 polyfill 的默认列表）。
- 把将它添加到需要它的目录的入口点：
  - [`packages/core-js/es`](https://github.com/zloirock/core-js/blob/master/packages/core-js/es)
  - [`packages/core-js/stable`](https://github.com/zloirock/core-js/blob/master/packages/core-js/stable)
  - [`packages/core-js/actual`](https://github.com/zloirock/core-js/blob/master/packages/core-js/actual)
  - [`packages/core-js/full`](https://github.com/zloirock/core-js/blob/master/packages/core-js/full)
  - [`packages/core-js/proposals`](https://github.com/zloirock/core-js/blob/master/packages/core-js/proposals)
  - [`packages/core-js/stage`](https://github.com/zloirock/core-js/blob/master/packages/core-js/stage)
  - [`packages/core-js/web`](https://github.com/zloirock/core-js/blob/master/packages/core-js/web).
- 添加单元测试到 [`tests/unit-global`](https://github.com/zloirock/core-js/blob/master/tests/unit-global) 和 [`tests/unit-pure`](https://github.com/zloirock/core-js/blob/master/tests/unit-pure) 中。
- 添加对入口点的测试到 [`tests/entries/unit.mjs`](https://github.com/zloirock/core-js/blob/master/tests/entries/unit.mjs) 中。
- 确认你遵循了[我们的代码风格](#风格指南)。
- 在自述文件 [README.md](https://github.com/zloirock/core-js/blob/master/README.md)、更新日志 [CHANGELOG.md](https://github.com/zloirock/core-js/blob/master/CHANGELOG.md) 和[文档](./docs/polyfill.md)中记录。

## 风格指南

代码风格必须遵循我们的 [ESlint 配置](https://github.com/zloirock/core-js/blob/master/tests/eslint/eslint.config.js)。你可以使用 [`npm run lint`](./testing.md) 进行测试。不同的地方有不同的语法和标准库限制：

- polyfill 的实现只能使用 ES3 语法和标准库，并且不能在全局范围内使用别的 polyfill。
- 单元测试必须使用现代语法和我们的[简约 Babel 配置](https://github.com/zloirock/core-js/blob/master/babel.config.js)。纯净版本的测试不能使用任何现代的标准库功能。
- 在 NodeJS 中执行的工具、脚本和测试只能使用 NodeJS 8 中可用的语法和标准库。

文件名必须是 [kebab case](https://en.wikipedia.org/wiki/Letter_case#Kebab_case)，即用连字号`-`连接单词。polyfill 模块的名字必须遵循命名约定 `namespace.subnamespace-where-required.feature-name`，比如 `esnext.set.intersection`。稳定的 ECMAscript 功能以 `es` 开头，ECMAscript 提案以 `esnext` 开头，其他 web 标准以 `web` 开头。
