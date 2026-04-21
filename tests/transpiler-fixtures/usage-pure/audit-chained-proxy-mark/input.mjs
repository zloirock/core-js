// deep proxy-global chain: globalThis.self.window.Array.from. walkSubsumedProxyChain seeds
// every intermediate MemberExpression + the leaf globalThis identifier. only `Array.from`
// polyfill emits (outer) - identifier `globalThis` must not fire a parallel `_globalThis`
globalThis.self.window.Array.from([1, 2, 3]);
