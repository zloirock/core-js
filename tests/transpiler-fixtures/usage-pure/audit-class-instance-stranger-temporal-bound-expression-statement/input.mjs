// a stranger of the SAME name calls after the dead write - the bound must not follow it
class Holder {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
function strangerCallsLater() {
  class Holder {
    ping() {
      return 1;
    }
  }
  new Holder().ping();
}
strangerCallsLater();
