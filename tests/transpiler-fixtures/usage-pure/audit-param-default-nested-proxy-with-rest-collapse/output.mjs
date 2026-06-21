import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// parameter destructure default with a proxy hop (`globalThis.self.Array`) and a rest sibling
// on a DECLARED function: the retained default keeps its value-identical proxy collapse
// (`_globalThis.Array` - `.self` would read undefined off the pure proxy on old targets). lossy
// emissions are sound here because the function is non-exported; exported / escaping stay verbatim.
function f({
  from: _unused,
  ...rest
} = _globalThis.Array) {
  let from = _Array$from;
  return [from, rest];
}
f();