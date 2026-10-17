// Same-named classes in different scopes have distinct instances. Writes through one class must not widen the fields of the other
// class.
class Holder {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
new Holder().getFirst();
