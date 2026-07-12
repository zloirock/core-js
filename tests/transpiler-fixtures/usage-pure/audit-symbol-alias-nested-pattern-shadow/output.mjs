import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a top-level `{ iterator } = Symbol` alias folds a computed member to the iterator-method
// helper; a NESTED-pattern binding of the same name (`{ constructor: { iterator } }`) reads
// `Symbol.constructor.iterator` (=== undefined at runtime), NOT the well-known key, so it must
// stay a raw computed read - the flat name-keyed fold would substitute the wrong value
const iterator = _Symbol$iterator;
export const viaTopLevel = _getIteratorMethod([1, 2]);
export function nestedShadow() {
  const {
    constructor: {
      iterator
    }
  } = _Symbol;
  return [3, 4][iterator];
}

// the renamed top-level form still folds; an assignment-form top-level folds too
const renamed = _Symbol$iterator;
export const viaRenamed = _getIteratorMethod([5, 6]);
let assigned;
assigned = _Symbol$iterator;
export const viaAssign = _getIteratorMethod([7, 8]);

// a NESTED assignment-form binding also bails
let deep;
({
  constructor: {
    iterator: deep
  }
} = _Symbol);
export const viaNestedAssign = [9][deep];