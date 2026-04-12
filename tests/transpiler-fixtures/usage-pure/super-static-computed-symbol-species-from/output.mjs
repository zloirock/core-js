import _Symbol$species from "@core-js/pure/actual/symbol/species";
import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  static [_Symbol$species]() {
    return _Array$from.call(this, []);
  }
}