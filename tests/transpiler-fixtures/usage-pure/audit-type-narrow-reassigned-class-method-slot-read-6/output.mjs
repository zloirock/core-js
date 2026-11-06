import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// a PRIVATE method has no writable slot at all - nothing can replace it, so it keeps its narrow
class Sealed {
  #rows() {
    return [11, 12];
  }
  read() {
    var _ref;
    return _includesMaybeArray(_ref = this.#rows()).call(_ref, 11);
  }
}
export const values = [new Sealed().read()];