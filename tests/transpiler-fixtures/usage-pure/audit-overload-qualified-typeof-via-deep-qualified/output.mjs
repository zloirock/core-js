import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// deeper qualification resolves through the same channel
declare namespace Outer {
  namespace Sub {
    function d(x: number): number[];
    function d(x: string): string;
  }
}
declare const f2: typeof Outer.Sub.d;
export const viaDeepQualified = _includesMaybeArray(_ref = f2(5)).call(_ref, 1);