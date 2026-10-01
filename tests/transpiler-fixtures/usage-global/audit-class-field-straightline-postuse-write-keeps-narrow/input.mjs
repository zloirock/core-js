// straight-line write at top level AFTER the last use - bounded out by source position (it is
// not inside a deferred function), so the items narrow holds and .at stays Array-only
class C {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
const c = new C();
c.getFirst();
c.items = "s";
