// `for (c.items in obj)` rebinds `c.items` to each enumerable key (a string) of `obj` - an external
// field write in for-in head shape. Folding it into the field flow widens `items`, so `.at` gets
// the generic polyfill.
declare const obj: object;
class C { items = [1, 2, 3]; getFirst() { return this.items.at(0); } }
const c = new C();
for (c.items in obj) {}
c.getFirst();
