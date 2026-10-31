// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression PARAM-DEFAULT
// receiver collapses the hop exactly as a const-init receiver does: `globalThis.self` is undefined on
// ie:11 / non-browser hosts. A left the build serves (`globalThis.self.Array`, and `globalThis.self.Number`,
// a global core-js extends in place) leaves no other operand live.
function f({ from, ...rest } = globalThis.self.Array || globalThis.self.Set || Map) {
  return from([1]);
}
f();
function g({ isInteger, ...rest } = globalThis.self.Number || globalThis.self.Set) {
  return isInteger(1);
}
g();
