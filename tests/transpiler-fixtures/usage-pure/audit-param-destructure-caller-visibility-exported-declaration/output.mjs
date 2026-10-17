import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed, and an inline default fills a
// leaf the caller deliberately left undefined.
const G = _globalThis;
export function exportedDeclaration([{
  WeakSet,
  Array: {
    from
  }
} = {
  WeakSet: _WeakSet,
  Array: {
    from: _Array$from
  }
}]) {
  return [WeakSet, from];
}