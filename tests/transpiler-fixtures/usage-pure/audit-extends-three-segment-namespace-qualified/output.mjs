import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// interface extends through a three-segment namespace path with type args;
// substitution through the qualified parent reaches members
namespace NS {
  export namespace Inner {
    export interface Base<T> {
      items: T[];
    }
  }
}
interface Sub<T> extends NS.Inner.Base<T> {}
declare const s: Sub<number>;
_includesMaybeArray(_ref = s.items).call(_ref, 1);
_flatMaybeArray(_ref2 = s.items).call(_ref2);