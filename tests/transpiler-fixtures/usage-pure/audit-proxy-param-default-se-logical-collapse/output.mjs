import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// A side-effect SequenceExpression wrapping a LOGICAL proxy-global param default
// (`= (effect(), globalThis.self.Array || Set)`) with a `...rest` sibling: the receiver survives as
// the param default, so each logical operand's proxy hop must be collapsed (`.self` dropped) the
// same way a non-SE logical default is. without peeling the SE tail before the logical check, the
// surviving default reads `_globalThis.self.Array` - undefined on a self-less realm (ie:11 / Node),
// throwing BEFORE the `||` can short-circuit. the SE prefix `effect()` is preserved
function effect() {}
function f({
  from: _unused,
  ...rest
} = (effect(), _globalThis.Array || _Set)) {
  let from = _Array$from;
  return from([1]);
}
f();