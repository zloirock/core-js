// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
const { from, ...rest } = Array;
const a = from([1]);
const { of: setOf, ...others } = Set;
const b = setOf(1, 2, 3);
export { a, rest, b, others };
