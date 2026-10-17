import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// and call signatures on a callable object type
declare const f: {
  (this: Window, x: string): number[];
  (x: number): string;
};
export const viaCallSignature = _atMaybeArray(_ref = f('a')).call(_ref, 2);