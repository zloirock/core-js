// a top-level `{ iterator } = Symbol` alias folds a computed member to the iterator-method
// helper; a NESTED-pattern binding of the same name (`{ constructor: { iterator } }`) reads
// `Symbol.constructor.iterator` (=== undefined at runtime), NOT the well-known key, so it must
// stay a raw computed read - the flat name-keyed fold would substitute the wrong value
const { iterator } = Symbol;
export const viaTopLevel = [1, 2][iterator];

export function nestedShadow() {
  const { constructor: { iterator } } = Symbol;
  return [3, 4][iterator];
}

// the renamed top-level form still folds; an assignment-form top-level folds too
const { iterator: renamed } = Symbol;
export const viaRenamed = [5, 6][renamed];

let assigned;
({ iterator: assigned } = Symbol);
export const viaAssign = [7, 8][assigned];

// a NESTED assignment-form binding also bails
let deep;
({ constructor: { iterator: deep } } = Symbol);
export const viaNestedAssign = [9][deep];
