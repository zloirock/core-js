import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// anonymous class with a private auto-accessor backed by an array literal. the private
// classification keys on the member key being a private name (a ClassAccessorProperty with a
// PrivateName key in babel, an AccessorProperty with a PrivateIdentifier key in oxc), so the
// field-flow narrows `this.#foo` to its array init and injects the array-specific `.at`. in an
// anonymous class the public-field path has no class binding to fold writes through, so a
// mis-classification as public would bail to the generic instance helper - making the narrow
// observable in the emitted import (array-specific vs generic).
export default new (class {
  accessor #foo = [10, 20];
  pick() {
    var _ref;
    return _atMaybeArray(_ref = this.#foo).call(_ref, -1);
  }
})().pick();