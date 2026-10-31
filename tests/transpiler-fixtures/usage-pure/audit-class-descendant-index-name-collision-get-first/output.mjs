import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// descendants are found through an index keyed by the SUPER'S NAME, so a class of that same name in
// another scope hands over its own subclasses as if they were this class's. an instance write through
// such a stranger then widens a field fold that nothing actually writes. the two rows differ ONLY in
// whether the stranger's name collides - one method each, so the import set says which row answered what
class Holder {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
new Holder().getFirst();