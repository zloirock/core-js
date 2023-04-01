---
icon: warn
category: feature
---

# 缺失的 polyfill

出于一些原因，Core-JS 并未包含对以下提案的 polyfill：

- ES `BigInt` 无法被 polyfill，因为这需要改变运算符的行为([更多信息](https://github.com/zloirock/core-js/issues/381))，不过你可以考虑使用 [`JSBI`](https://github.com/GoogleChromeLabs/jsbi)。
- ES `Proxy` 无法被 polyfill，你可以使用 [`proxy-polyfill`](https://github.com/GoogleChrome/proxy-polyfill) 来获得 `Proxy` API 的一个很小的子集。
- ES `String#normalize` 并不常用但实现体积很大。如果你真的要用到这个功能，可以使用 [unorm](https://github.com/walling/unorm/)。
- ECMA-402 `Intl` 因为体积过大所以没有包含。你可以使用[这些 polyfill](https://formatjs.io/docs/polyfills)。
- `window.fetch` 不是一个跨平台的功能，在某些环境下它没有意义。因此我不认为它应该被包含在 Core-JS 中. 考虑到对此功能的大量请求, 它 _可能_ 会在未来版本中实现。目前你可以使用像 [github/fetch](https://github.com/github/fetch) 等 polyfill。
