import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// An unknown computed key may override the field. Test the stored constructor's identity
// before selecting either candidate's static method.
class NS {
  static M = Array;
  static M = _Iterator;
}
const from = _Iterator$from;
export function dynamicKeyBails(o) {
  class Guard {
    static P = Array;
    static [o.k] = _Iterator;
  }
  const {
      P: _ref
    } = Guard,
    from = _ref === _Iterator ? _Iterator$from : _ref === Array ? _Array$from : _ref.from;
  return from([1, 2]);
}