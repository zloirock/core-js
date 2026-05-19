// Two sibling scopes both binding `const c = new C()` create distinct bindings under the
// same name. collectClassInstanceClosure must key the closure by binding identity (not by
// name) so the FIRST declarator's binding isn't overwritten by the SECOND. without
// binding-keyed closure, `closure.get('c')` returns scope-B's binding only; writes through
// scope-A's `c` fail the `getBinding('c') === storedBinding` identity check and the field
// flow scan misses them, leaving narrow on stale Array type when it should have widened
class C {
  items = [1];
  getFirst() { return this.items.at(0); }
}
function scopeA() {
  const c = new C();
  c.items = "fromA";
  return c.getFirst();
}
function scopeB() {
  const c = new C();
  return c.getFirst();
}
scopeA();
scopeB();
