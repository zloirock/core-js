// `({ a: { v: c.items } } = src)` writes `c.items` through a NESTED destructuring pattern. The
// write-target collector recurses into the inner pattern and folds the member write into the field
// flow, widening `items`, so `.at` gets the generic polyfill.
declare const src: { a: { v: string } };
class C { items = [1, 2, 3]; getFirst() { return this.items.at(0); } }
const c = new C();
// @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
({ a: { v: c.items } } = src);
c.getFirst();
