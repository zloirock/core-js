// computed-key receiver wrapped in two layers of TS `as any` casts: the rewrite must
// still recognise `Symbol.iterator` and emit the well-known-symbol polyfill.
const iter = obj[((Symbol as any) as any).iterator];
