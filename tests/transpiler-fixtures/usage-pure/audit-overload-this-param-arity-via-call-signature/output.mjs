import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// and call signatures on a callable object type
declare const f: {
  (this: Window, x: string): number[];
  (x: number): string;
};
// @ts-expect-error a call no overload admits is the shape under test
export const viaCallSignature = _atMaybeArray(_ref = f('a')).call(_ref, 2);