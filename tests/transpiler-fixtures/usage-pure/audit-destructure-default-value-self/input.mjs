// Proxy-global alias via `self` (rather than `globalThis`). `const { Symbol: S = null } = self`
// still resolves `S` as the global `Symbol`, so `S.iterator in obj` fires the
// `is-iterable` polyfill.
const { Symbol: S = null } = self;
S.iterator in obj;
