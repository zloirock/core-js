import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// an alias reads its source where it is declared, so a `var` of the same name in a block of a function the
// use stands in - hoisted to that function, not to the alias - does not shadow that read: the alias still
// holds the global, read directly, in a closure or as a destructure source
const B = Array;
export function direct(c) {
  if (c) {
    var Array = 1;
  }
  return _Array$from(xs);
}
const P = _Promise;
export function closure(c) {
  if (c) {
    var Promise = 1;
  }
  return () => _Promise$resolve(1);
}
const I = _Iterator;
export function destructured(c) {
  if (c) {
    var Iterator = 1;
  }
  const from = _Iterator$from;
  return from(xs);
}