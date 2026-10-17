import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakMap from "@core-js/pure/actual/weak-map";
// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed, and an inline default fills a
// leaf the caller deliberately left undefined.
const G = _globalThis;
function localDeclaration([{
  WeakMap,
  Array: {
    of
  }
} = {
  WeakMap: _WeakMap,
  Array: {
    of: _Array$of
  }
}]) {
  return [WeakMap, of];
}
export { localDeclaration };