// `globalThis?.Array.from(...)` proxy access via optional chain: the static method
// is recognised as `Array.from` and rewritten to the pure-mode polyfill.
globalThis?.Array?.from([1]);
globalThis?.Object.keys("abc");
self?.Promise?.resolve(1);
