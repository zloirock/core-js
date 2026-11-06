// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
// A `??` over a parenthesized `||` whose left the build serves (`globalThis.Array`, `globalThis.Map`, and
// `globalThis.Number`, a global core-js extends in place) folds the rest away, the inner `||` with it.
const { from, ...rest } = globalThis.Array ?? (globalThis.Set || Map);
const { groupBy, ...others } = globalThis.Map ?? (globalThis.WeakMap || Set);
export { from, rest, groupBy, others };
const { isInteger, ...props } = globalThis.Number ?? (globalThis.WeakRef || Map);
export { isInteger, props };
