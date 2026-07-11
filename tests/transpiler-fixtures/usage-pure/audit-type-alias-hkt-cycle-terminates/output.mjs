import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a cyclic HKT alias body (`F<0>` re-splicing the SAME type-param ref every hop) must
// TERMINATE: each param name splices at most once, then the walk bails and the receiver
// degrades to the generic dispatch (the transpile used to loop forever here - build DoS)
type Apply<F> = F<0>;
function foo<F>(x: Apply<F>) {
  return _at(x).call(x, 0);
}
// self-application terminates the same way
function h(x: Apply<Apply>) {
  return _includes(x).call(x, 1);
}
// PRODUCTIVE splice control: one hop through the param resolves to a real alias and the
// receiver types through (`string[]` -> typed array dispatch)
type Wrap<F, X> = F<X>;
type Boxed<T> = T[];
function f(x: Wrap<Boxed, string>) {
  return _flatMaybeArray(x).call(x);
}
// a BUILT-IN ctor as the HKT arg types through the container path (no AST body to walk)
function fb(x: Apply<Array>) {
  return _toReversedMaybeArray(x).call(x);
}
// a two-name alternating body terminates the same way (each param name splices once)
type Two<F, G> = F<G<0>>;
function g2<F, G>(x: Two<F, G>) {
  return _findLastMaybeArray(x).call(x, Boolean);
}
// a two-hop chain THROUGH a param stays productive (Outer -> Inner -> G<0> -> Boxed)
type Outer<F> = Inner<F>;
type Inner<G> = G<0>;
function h2(x: Outer<Boxed>) {
  return _flatMapMaybeArray(x).call(x, v => [v]);
}
export { foo, h, f, fb, g2, h2 };