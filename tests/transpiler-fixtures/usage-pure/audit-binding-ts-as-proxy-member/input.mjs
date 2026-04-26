// binding via TS `as` cast on a proxy global: the cast is peeled and the alias
// still resolves to the pure-mode polyfill on subsequent references.
const P = (self as any).Promise;
P.resolve(1);
