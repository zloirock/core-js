import "core-js/modules/es.array.at";
// class accessor pair (getter + setter) defers actual storage type resolution to runtime;
// `at` dispatch bails on type narrowing but generic array-instance polyfill emits regardless
class Store {
  set items(v) {
    this._items = v;
  }
  get items() {
    return ['x', 'y'];
  }
}
const s = new Store();
s.items.at(0);