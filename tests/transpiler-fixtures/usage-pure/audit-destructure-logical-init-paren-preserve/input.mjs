// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
const { from, ...rest } = globalThis.Array ?? (globalThis.Set || Map);
const { groupBy, ...others } = globalThis.Map ?? (globalThis.WeakMap || Set);
export { from, rest, groupBy, others };
