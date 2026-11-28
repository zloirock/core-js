import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
namespace NS3 {
  export class Cls {
    static make(x) {
      return [1, 2, 3];
    }
  }
}
declare const m3: typeof NS3.Cls;
_atMaybeArray(_ref = m3.make(0)).call(_ref, -1);