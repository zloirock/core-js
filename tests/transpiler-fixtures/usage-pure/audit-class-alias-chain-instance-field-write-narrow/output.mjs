import _at from "@core-js/pure/actual/instance/at";
// const D = C; const E = D; new E().items = "X" - multi-hop alias chain.
// `getClassBindingClosure` walks `const X = Source` chains through the relaxed
// classifier; instance writes via the leaf alias `E` must widen C's field fold same as
// direct `const D = C; new D().items = "X"` does. without the chain walk, the leaf alias's
// new-expression instance bound to `e` falls outside descendant.names and the external
// write is silently dropped from the field-flow union - unsound narrow
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
const D = C;
const E = D;
const e = new E();
e.items = "string";
new C().getFirst();