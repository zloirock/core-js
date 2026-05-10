import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// interface extending a 4-segment qualified name (NS.Mid.Inner.Base); namespace walker
// must traverse through every segment, не bail at intermediate hop
namespace NS {
  export namespace Mid {
    export namespace Inner {
      export interface Base {
        bag: number[];
      }
    }
  }
}
interface Sub extends NS.Mid.Inner.Base {}
declare const s: Sub;
_atMaybeArray(_ref = s.bag).call(_ref, 0);
_flatMaybeArray(_ref2 = s.bag).call(_ref2);