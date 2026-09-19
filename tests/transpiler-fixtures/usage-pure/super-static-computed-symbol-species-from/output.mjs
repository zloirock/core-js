import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol$species from "@core-js/pure/actual/symbol/species";
class A extends Array {
  static [_Symbol$species]() {
    return _Array$from.call(this, []);
  }
}