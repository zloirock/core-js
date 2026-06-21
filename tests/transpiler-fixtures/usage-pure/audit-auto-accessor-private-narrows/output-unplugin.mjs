import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// anonymous class with a private auto-accessor backed by an array literal. classification as
// private keys on the private-name key (ClassAccessorProperty + PrivateName in babel,
// AccessorProperty + PrivateIdentifier in oxc), so `this.#foo` narrows to its array init and
// emits the array-specific `.at`; mis-classifying it as public would emit the generic helper
export default new (class {
  accessor #foo = [10, 20];
  pick() {
    var _ref;
    return _atMaybeArray(_ref = this.#foo).call(_ref, -1);
  }
})().pick();