// a write to the OUTER class's `#field` from a lexically-nested class that declares no
// same-named private still binds the outer slot - it joins the external-write fold, so
// the outer field's narrow bails (nearest-enclosing-class scoping excluded it and the
// stale Array narrow threw on the written string, ie:11)
class Outer {
  #x = [1, 2, 3];
  read() {
    return this.#x.at(0);
  }
  static make() {
    return class Inner {
      poison(o) {
        o.#x = 'string';
      }
    };
  }
}
export const viaNestedWrite = new Outer().read();

// a write-free private field keeps the narrow
class Sealed {
  #x = [4, 5];
  read() {
    return this.#x.includes(4);
  }
}
export const viaSealed = new Sealed().read();
