// binding via TS `as` cast on a proxy global `(self as any).Promise`: through the alias
// `P`, runtime calls still resolve to the polyfilled `Promise`.
const P = (self as any).Promise;
P.resolve(1);
