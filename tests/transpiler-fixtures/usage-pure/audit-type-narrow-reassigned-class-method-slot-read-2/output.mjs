import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// the same slot with NO write keeps its narrow - the declaration is all there is
class Intact {
  items() {
    return [3, 4];
  }
  read() {
    var _ref;
    return _includesMaybeArray(_ref = this.items()).call(_ref, 3);
  }
}
export const values = [new Intact().read()];