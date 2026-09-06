// A private member's name is not a member of anything reachable: `this.#at` reads the class's own
// brand, never `Array.prototype.at`, so no instance claim fires on it. What the class DOES owe is
// the private-method lowering's own brand check, one `WeakSet` per class.
class C {
  #at(i) {
    return i;
  }
  get(i) {
    return this.#at(i);
  }
}