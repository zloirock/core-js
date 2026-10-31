import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed-key class method: the walk from `[C.X]` (key) up the path tree must NOT cache
// its null result on the ClassMethod node itself - that node IS the answer for the
// body-side walk from `this.items.at(0)`. fix: don't push the ClassMethod into `visited`
// when we skip past it via key-slot, so backfill only marks outer ancestors as null
class C {
  static X = "name";
  items = [1, 2, 3];
  [C.X]() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
new C()["name"]();