import _Array$from from "@core-js/pure/actual/array/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression PARAM-DEFAULT
// receiver collapses the hop exactly as a const-init receiver does: `globalThis.self` is undefined on
// ie:11 / non-browser hosts. A left the build serves (`globalThis.self.Array`, and `globalThis.self.Number`,
// a global core-js extends in place) leaves no other operand live.
function f({
  from: _unused,
  ...rest
} = _self.Array) {
  let from = _Array$from;
  return from([1]);
}
f();
function g({
  isInteger: _unused2,
  ...rest
} = _self.Number) {
  let isInteger = _Number$isInteger;
  return isInteger(1);
}
g();