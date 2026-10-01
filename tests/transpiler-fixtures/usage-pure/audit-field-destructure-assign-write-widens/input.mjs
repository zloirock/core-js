// `({ v: c.items } = src)` is a destructuring-assignment write to `c.items` through an opaque
// source - an external field write the bare-`c.items = ...` scan misses. Folding it into the
// field flow widens `items` away from its array initializer, so `.at` gets the generic polyfill.
declare const src: { v: string };
class C { items = [1, 2, 3]; getFirst() { return this.items.at(0); } }
const c = new C();
({ v: c.items } = src);
c.getFirst();
