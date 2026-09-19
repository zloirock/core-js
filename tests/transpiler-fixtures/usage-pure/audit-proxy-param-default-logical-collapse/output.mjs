import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression PARAM-DEFAULT
// receiver must collapse the hop in each live non-pure operand, exactly as a const-init receiver does:
// `globalThis.self` is undefined on ie:11 / non-browser hosts, so an evaluated operand throws BEFORE
// the `||` can short-circuit. Each operand is collapsed individually; pure-ctor operands
// (`globalThis.self.Set`, `Map`) whole-swap to their pure constructor instead.
function f({
  from,
  ...rest
} = _self.Array || _Set || _Map) {
  return from([1]);
}
f();