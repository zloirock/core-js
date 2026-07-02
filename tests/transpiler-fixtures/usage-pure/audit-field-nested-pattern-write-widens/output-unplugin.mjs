import _at from "@core-js/pure/actual/instance/at";
// `({ a: { v: c.items } } = src)` writes `c.items` through a NESTED destructuring pattern. The
// write-target collector recurses into the inner pattern and folds the member write into the field
// flow, widening `items`, so `.at` gets the generic polyfill.
declare const src: { a: { v: string } };
class C { items = [1, 2, 3]; getFirst() {
var _ref; return _at(_ref = this.items).call(_ref, 0); } }
const c = new C();
({ a: { v: c.items } } = src);
c.getFirst();