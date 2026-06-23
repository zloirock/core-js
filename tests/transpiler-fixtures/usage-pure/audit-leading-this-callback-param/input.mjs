// A callback passed to a typed method gets its param types from the method's callback signature. when
// the callback is a function expression that declares a leading `this` pseudo-param, its param slots
// must be this-dropped before matching the (also this-dropped) signature slots - else `a` lines up one
// slot late and never picks up its `string[]` type, losing the type-specific helper. distinct methods
// keep each resolution identifiable.
interface Consumer<A> {
  m(cb: (a: A) => void): void;
  n(cb: (b: A) => void): void;
}
declare const c: Consumer<string[]>;
c.m(function (this: Window, a) {
  return a.at(0);
});
c.n(function (this: Window, b) {
  return b.includes(1);
});
export {};
