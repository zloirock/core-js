// `isPropertyMember` covers ClassProperty (public) alongside ClassPrivateProperty, so the
// same fold runs for `this.box` as for `this.#box` - init `null` unions with `Array.from`
// assignment to Array, `?.at(0)` picks the array-specific polyfill variant
class Maybe {
  box = null;
  set(xs) { this.box = Array.from(xs); }
  firstOrNull() { return this.box?.at(0) ?? null; }
}
