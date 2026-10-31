import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
namespace NS {
  export interface Data {
    items: number[];
  }
}
declare const d: NS.Data;
_atMaybeArray(_ref = d.items).call(_ref, 0);