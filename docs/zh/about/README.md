# 什么是 core-js?

- 它是 JavaScript 标准库的 polyfill，它支持
  - 最新的 [ECMAScript](https://zh.wikipedia.org/wiki/ECMAScript) 标准
  - ECMAScript 标准库提案
  - 一些 [WHATWG](https://zh.wikipedia.org/wiki/WHATWG) / [W3C](https://zh.wikipedia.org/wiki/万维网联盟) 标准（跨平台或者 ECMAScript 相关）
- 它最大限度的模块化: 你能仅仅加载你想要使用的功能
- 它能够不污染全局命名空间
- 它和 `babel` 紧密集成: 这能够优化`core-js`的导入

它是最普遍、[最流行](https://npmtrends.com/airbnb-js-shims-vs-core-js-vs-es5-shim-vs-es6-shim-vs-js-polyfills-vs-polyfill-library-vs-polyfill-service) 的给 JavaScript 标准库打补丁的方式，但是有很大一部分开发者并不知道他们间接的使用了`core-js`🙂