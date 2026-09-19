// Method-call-return consumer of the chained-alias default collider: `o.get()` yields the inner alias's
// type-param default, resolved through the same chain-keyed subst as a property read. Inner's default
// Q = A is the outer `type A = number[]` (Inner has no param A); the outer alias Outer<A> reuses A as its
// own param, but that instantiation binding (string) must not leak into the inner default's scope. The
// call result is number[], so the array at variant applies, not the string variant.
type A = number[];
type Outer<A> = Inner<A>;
type Inner<X, Q = A> = {
  get(): Q;
};
declare const o: Outer<string>;
o.get().at(0);
