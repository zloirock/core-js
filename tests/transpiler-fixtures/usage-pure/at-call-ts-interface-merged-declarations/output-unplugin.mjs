import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
interface Box { items: number[] }
interface Box { meta: string[] }
declare const b: Box;
_atMaybeArray(_ref = b.meta).call(_ref, -1);