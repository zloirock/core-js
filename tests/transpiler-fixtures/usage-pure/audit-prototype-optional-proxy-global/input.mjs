// `globalThis?.Array.prototype.at(0)` - optional chain on proxy-global with `.prototype`
// access. Plugin still recognizes Array.prototype through the proxy-global receiver
// and emits the array-specific `at` polyfill.
globalThis?.Array.prototype.at(0);
