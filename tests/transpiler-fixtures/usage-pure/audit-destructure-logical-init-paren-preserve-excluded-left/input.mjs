// Other sources keep their rest exclusions and independently claimed statics. A `??` left whose constructor
// entry is excluded (`globalThis.Map`, while `groupBy` keeps its own) still decides - the data subset carries
// `Map` - so its parenthesized `||` right never runs and leaves whole with its import, the rest reading the raw
// left once after the claimed static.
const { groupBy, ...props } = globalThis.Map ?? (globalThis.WeakRef || Set);
export { groupBy, props };
