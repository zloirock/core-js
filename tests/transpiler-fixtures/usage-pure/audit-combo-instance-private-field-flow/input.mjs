// instance #private field whose type widens from Array to Array|string via a write through a SIBLING
// instance binding (other.#n = 'x'), not `this`. the flow scan must fold the in-class-body writes to
// the scope-closed private field, not just the `this.#n` writes, so the read narrows to the generic
// at variant (works on both) instead of the array-only variant (wrong on a string at ie:11)
class C {
  #n = [];
  copy(other) { other.#n = 'x'; }
  first() { return this.#n.at(0); }
}
