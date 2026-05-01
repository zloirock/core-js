// destructure with a RestElement: `{ from, ...rest } = Array`. synth-swap can't be
// applied because `...rest` would lose properties; fallback should extract `from` as a
// dispatched binding while keeping the rest pattern over the original `Array` receiver
const { from, ...rest } = Array;
const a = from([1]);
// same shape with `Set` - `of` is dispatched but the rest pattern still must read the
// remaining static methods from the real Set
const { of: setOf, ...others } = Set;
const b = setOf(1, 2, 3);
export { a, rest, b, others };
