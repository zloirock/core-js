import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// parameter destructure default combining a COMPUTED proxy hop (`globalThis['self']`) with a
// rest sibling on a DECLARED function: the retained default keeps its value-identical collapse
// to `_globalThis.Array`. lossy emissions are sound here because the function is non-exported
// and every local call leaves the default in place; exported / escaping ones stay verbatim.
function f({
  from: _unused,
  ...rest
} = _self.Array) {
  let from = _Array$from;
  return [from, rest];
}
f();