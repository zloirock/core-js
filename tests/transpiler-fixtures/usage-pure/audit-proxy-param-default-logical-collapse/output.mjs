import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression PARAM-DEFAULT
// receiver must collapse the hop in each live non-pure operand, exactly as a const-init receiver does:
// `globalThis.self` is undefined on ie:11 / non-browser hosts, so an evaluated operand throws BEFORE
// the `||` can short-circuit. Each operand is collapsed individually; pure-ctor operands
// (`globalThis.self.Set`, `Map`) whole-swap to their pure constructor instead.
function f({
  from: _unused,
  ...rest
} = _globalThis.Array || _Set || _Map) {
  let from = _Array$from;
  return from([1]);
}
f();