import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a parenthesized proxy-global root (`(globalThis)`) in a DECLARED function's param-default
// rest shape: the retained default keeps its paren-aware value-identical collapse; the
// hop-deletion span must start at the paren-inclusive root, else it overlaps the root rewrite
// and the transform queue rejects the composition. lossy here is sound (function is non-exported).
function f({
  from: _unused,
  ...rest
} = _globalThis.Array) {
  let from = _Array$from;
  return from([1]);
}
f();