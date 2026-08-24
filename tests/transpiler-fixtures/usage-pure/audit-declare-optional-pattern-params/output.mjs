import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a declare-signature pattern parameter may carry `?` on the PATTERN itself - the printed
// signature must keep it, annotated or not
declare function withArray([a]?: number[]): void;
declare function withObject({
  a
}?: {
  a: 1;
}): void;
declare function bareOptional([a]?): void;
export const last = _atMaybeArray(_ref = [1, 2, 3]).call(_ref, -1);