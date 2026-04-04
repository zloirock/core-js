const items = Symbol();
class Store {
  [items]() { return [1, 2]; }
  get items() { return 'hello'; }
}
const s = new Store();
s.items.at(0);
