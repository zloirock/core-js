import _Array$from from "@core-js/pure/actual/array/from";
// deep proxy-global chain: globalThis.self.window.Array.from. walkSubsumedProxyChain seeds
// every intermediate MemberExpression + the leaf globalThis identifier. only `Array.from`
// polyfill emits (outer) - identifier `globalThis` must not fire a parallel `_globalThis`
_Array$from([1, 2, 3]);