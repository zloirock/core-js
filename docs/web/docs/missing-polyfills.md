# Missing polyfills
- ES `BigInt` can't be polyfilled since it requires changes in the behavior of operators, you can find more info [here](https://github.com/zloirock/core-js/issues/381). You could try to use [`JSBI`](https://github.com/GoogleChromeLabs/jsbi).
- ES `Proxy` can't be polyfilled, you can try to use [`proxy-polyfill`](https://github.com/GoogleChrome/proxy-polyfill) which provides a very small subset of features.
- ES `String#normalize` is not a very useful feature, but this polyfill will be very large. If you need it, you can use [unorm](https://github.com/walling/unorm/).
- ECMA-402 `Intl` is missing because of its size. You can use [these polyfills](https://formatjs.github.io/docs/polyfills).
- `fetch` is not polyfilled: it depends on the networking of the platform, and now it's natively available in all modern browsers, Node.js 18+, Deno and Bun. For legacy engines, you can use, for example, [this polyfill](https://github.com/JakeChampion/fetch).
- ES `WeakRef` and `FinalizationRegistry` can't be polyfilled since they require integration with the garbage collector.
- ES `SharedArrayBuffer` and `Atomics` can't be polyfilled since they require memory shared between threads.
- ES resizable `ArrayBuffer`, growable `SharedArrayBuffer` and `Float16Array` are not polyfilled. `Math.f16round` and `DataView` methods for `float16` values are polyfilled.
- Some new ES `RegExp` syntax, like lookbehind assertions or `d` and `v` flags, is not polyfilled.
