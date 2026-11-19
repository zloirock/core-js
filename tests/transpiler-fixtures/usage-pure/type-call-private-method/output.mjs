import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Private methods cannot be overridden, so their concrete body remains authoritative.
class Base {
  #value(): string | number[] {
    return 'ab';
  }
  last() {
    var _ref;
    return _atMaybeString(_ref = this.#value()).call(_ref, -1);
  }
}
export { Base };