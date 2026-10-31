import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A computed constructor leaf keeps its effect channel during parameter synthesis.
// An effectful realm-hop key keeps the original parameter receiver instead.
let spineKeyReads = 0;
let ownKeyReads = 0;
function withOf({
  of
} = _globalThis[spineKeyReads++, 'self'].Array) {
  return of;
}
function withFrom({
  from
} = (_globalThis[ownKeyReads++, 'Array'], {
  from: _Array$from
})) {
  return from;
}
export { withOf, withFrom };