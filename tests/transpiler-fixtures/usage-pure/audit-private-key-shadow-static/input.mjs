// PrivateIdentifier (modern) for private keys. Both parsers emit `PrivateIdentifier` -
// legacy `PrivateName` is dead at parse-time. Shadow checks on `#Set` private member
// must NOT confuse the bare global Set in `new Set(...)` initializer
class C {
  #Set = new Set([1, 2, 3]);
  upper() {
    const target = this.#Set;
    return Array.from(target).at(0);
  }
}
new C();
