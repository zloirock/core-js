// a getter (kind 'get') must yield its DECLARED return type, not the enclosing Function, so a
// method call on the accessed property narrows to the declared receiver. here both getters return
// number[], so each instance method call substitutes the array-specific receiver-less helper. two
// methods so each line's import is distinct.
class C {
  get rows(): number[] { return [1]; }
}
new C().rows.includes(1);
new C().rows.at(0);
