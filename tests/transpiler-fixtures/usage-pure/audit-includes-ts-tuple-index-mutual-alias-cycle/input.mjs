// a MUTUAL two-alias `Readonly` wrapper cycle (`A<T>=Readonly<B<T>>; B<T>=Readonly<A<T>>`) must bail
// on the element-type cycle, so the tuple-index receiver stays unknown-typed and `.includes`
// degrades to the generic instance polyfill instead of overflowing the resolver
type A<T> = Readonly<B<T>>;
type B<T> = Readonly<A<T>>;
declare const x: A<number>[0];
x.includes(1);
