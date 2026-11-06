// two colliding defaults in one inner alias, each resolving INDEPENDENTLY to its own lexical type.
// Inner's `P = A` / `Q = B` reference the outer `type A = number[]` / `type B = string`, while
// Outer<A, B> reuses both names as params; those instantiation bindings must NOT leak into the inner
// defaults' scope. so `a` is number[] (array .at) and `b` is string (string .includes) - no cross-contamination
type A = number[];
type B = string;
type Outer<A, B> = Inner<A, B>;
type Inner<X, Y, P = A, Q = B> = {
  a: P;
  b: Q;
};
declare const o: Outer<string, number[]>;
o.a.at(0);
o.b.includes('x');
