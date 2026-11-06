// `let c; c = new C(); c.m()` - assignment-init binding tracked in closure (no writes
// through `c`), narrow fires for instance method. previously the assignment-bound shape
// hit isLeakPosition=true and bailed the closure entirely
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
let c;
c = new C();
c.getFirst();
