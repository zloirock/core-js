// `globalThis.Map` - proxy member must resolve to Map polyfill.
// Also test `globalThis.self.Promise.resolve(1)` chain.
const m = new globalThis.Map();
const r = globalThis.self.Promise.resolve(1);
