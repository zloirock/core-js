// the stranger's instance is BOUND, so the write travels through its binding
class Holder {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
function strangerBoundInstanceWrite() {
  class Holder {}
  const s = new Holder();
  s.items = "string";
}
strangerBoundInstanceWrite();
