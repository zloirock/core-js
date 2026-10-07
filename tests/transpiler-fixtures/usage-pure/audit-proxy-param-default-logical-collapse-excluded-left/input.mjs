// A proxy-global member chain with a redundant `.self` hop inside a LOGICAL-expression PARAM-DEFAULT
// receiver whose left the build does not serve (`Reflect`, its namespace entry excluded, while `getPrototypeOf`
// keeps its own) collapses the hop in each live non-pure operand - `globalThis.self` is undefined off-browser -
// while a pure-ctor operand (`globalThis.self.Set`) whole-swaps to its pure constructor.
function g({ getPrototypeOf, ...rest } = globalThis.self.Reflect || globalThis.self.Set) {
  return getPrototypeOf([]);
}
g();
