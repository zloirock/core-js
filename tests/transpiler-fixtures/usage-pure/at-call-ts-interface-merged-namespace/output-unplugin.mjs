import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
namespace NS {
  export interface Box { items: number[] }
  export interface Box { meta: string[] }
}
declare const b: NS.Box;
_atMaybeArray(_ref = b.meta).call(_ref, -1);