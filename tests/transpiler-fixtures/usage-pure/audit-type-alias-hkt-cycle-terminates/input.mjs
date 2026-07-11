// a cyclic HKT alias body (`F<0>` re-splicing the SAME type-param ref every hop) must
// TERMINATE: each param name splices at most once, then the walk bails and the receiver
// degrades to the generic dispatch (the transpile used to loop forever here - build DoS)
type Apply<F> = F<0>;
function foo<F>(x: Apply<F>) { return x.at(0); }
// self-application terminates the same way
function h(x: Apply<Apply>) { return x.includes(1); }
// PRODUCTIVE splice control: one hop through the param resolves to a real alias and the
// receiver types through (`string[]` -> typed array dispatch)
type Wrap<F, X> = F<X>;
type Boxed<T> = T[];
function f(x: Wrap<Boxed, string>) { return x.flat(); }
// a BUILT-IN ctor as the HKT arg types through the container path (no AST body to walk)
function fb(x: Apply<Array>) { return x.toReversed(); }
// a two-name alternating body terminates the same way (each param name splices once)
type Two<F, G> = F<G<0>>;
function g2<F, G>(x: Two<F, G>) { return x.findLast(Boolean); }
// a two-hop chain THROUGH a param stays productive (Outer -> Inner -> G<0> -> Boxed)
type Outer<F> = Inner<F>;
type Inner<G> = G<0>;
function h2(x: Outer<Boxed>) { return x.flatMap(v => [v]); }
export { foo, h, f, fb, g2, h2 };
