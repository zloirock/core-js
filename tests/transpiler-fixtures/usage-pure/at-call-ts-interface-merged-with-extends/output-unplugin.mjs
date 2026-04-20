import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
interface Base { items: number[] }
interface Mixin { meta: string[] }
interface Box extends Base {}
interface Box extends Mixin {}
declare const b: Box;
_atMaybeArray(_ref = b.items).call(_ref, -1);