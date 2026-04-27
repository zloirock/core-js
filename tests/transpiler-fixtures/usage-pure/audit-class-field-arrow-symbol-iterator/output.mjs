import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// class field with arrow body returning `Symbol.iterator`. private field initializer is
// an arrow expression - inner `Symbol.iterator` access reaches the standalone visitor and
// gets polyfilled to `_Symbol$iterator`. covers class-field-as-arrow-body shape, arrow
// runs in static-like scope but field initializer fires per-instance
class C {
  #iter = () => _Symbol$iterator;
}
new C();