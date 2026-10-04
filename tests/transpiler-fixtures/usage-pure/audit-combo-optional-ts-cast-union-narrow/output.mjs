import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// combo: TS cast narrows discriminated union to `number[]` leg + outer optional chain guards
// the receiver + Array-specific instance.at polyfill fires on the narrowed leg
type Shape = {
  data: number[];
} | {
  data: string;
};
declare const s: Shape;
null == s as {
  data: number[];
} ? void 0 : _atMaybeArray(_ref = (s as {
  data: number[];
}).data).call(_ref, 0);