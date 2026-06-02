// `[c.items] = src` is an array-pattern destructuring write to `c.items` through an opaque source.
// Folding this external write into the field flow widens `items` away from its array initializer,
// so `.at` gets the generic polyfill. Distinct from the object-pattern write shape.
declare const src: string[];
class C { items = [1, 2, 3]; getFirst() { return this.items.at(0); } }
const c = new C();
[c.items] = src;
c.getFirst();
