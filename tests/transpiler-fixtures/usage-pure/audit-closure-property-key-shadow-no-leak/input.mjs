// an object-literal property key shares a name with a closure binding `c`. the Identifier
// visitor walks property keys, so without filtering non-reference positions the key `c`
// registers as a reference to the binding, reads as a leak, and the closure bails to null,
// disabling the narrow. filtering keeps property keys invisible to the binding-ref index
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
function probe() {
  const c = new C();
  const meta = { c: 'unrelated-key' };
  return [c.getFirst(), meta];
}
probe();
