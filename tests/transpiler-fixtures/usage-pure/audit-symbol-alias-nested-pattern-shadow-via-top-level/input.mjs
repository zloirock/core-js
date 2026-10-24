// a top-level `{ iterator } = Symbol` alias folds a computed member to the iterator-method
// helper; a NESTED-pattern binding of the same name (`{ constructor: { iterator } }`) reads
// `Symbol.constructor.iterator` (=== undefined at runtime), NOT the well-known key, so it must
// stay a raw computed read - the flat name-keyed fold would substitute the wrong value
const { iterator } = Symbol;
export const viaTopLevel = [1, 2][iterator];
