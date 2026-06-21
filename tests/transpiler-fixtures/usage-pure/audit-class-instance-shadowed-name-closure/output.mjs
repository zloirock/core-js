import _at from "@core-js/pure/actual/instance/at";
// Two sibling scopes each bind `const c = new C()` - distinct bindings under the same name.
// the instance closure must be keyed by binding identity, not by name, so scope-A's binding
// isn't overwritten by scope-B's. a name-keyed closure keeps only scope-B's; writes through
// scope-A's `c` then fail the identity check, leaving the narrow on stale Array type
class C {
  items = [1];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
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