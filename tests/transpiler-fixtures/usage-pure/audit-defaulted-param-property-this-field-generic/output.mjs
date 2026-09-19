import _at from "@core-js/pure/actual/instance/at";
// usage-pure defaulted parameter-property whose field is read via `this` (`this.items.at(0)`):
// neither plugin narrows a parameter-property field to its declared type, so BOTH emit the generic
// instance helper (`_at`, not the array-specific Maybe). the crawler pre-pass that unwraps the
// defaulted parameter-property keeps this parity - the unwrap does not regress narrowing or the
// emitted helper relative to a non-defaulted parameter-property. regression lock
class C {
  constructor(public items: number[] = []) {}
  read() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
new C().read();