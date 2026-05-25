// `let c = otherValue; c = new C(); c.m()` - the let was declared WITH an initial value
// (different from new C()), so the binding holds multiple distinct values across its
// lifetime. assignmentInitName check requires bare-let (no init) so this case stays
// conservative-bail: `c.getFirst()` emits generic polyfill since c might be the earlier value
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
let c = { getFirst: () => 'x' };
c = new C();
c.getFirst();
