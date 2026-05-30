import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// parameter destructure default combining a COMPUTED proxy hop (`globalThis['self']`) with a
// ...rest sibling. the computed hop must be recognised and COLLAPSED to `_globalThis.Array`
function f({
  from: _unused,
  ...rest
} = _globalThis.Array) {
  let from = _Array$from;
  return [from, rest];
}
f();