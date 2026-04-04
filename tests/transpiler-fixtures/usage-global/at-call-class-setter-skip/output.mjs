import "core-js/modules/es.array.at";
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