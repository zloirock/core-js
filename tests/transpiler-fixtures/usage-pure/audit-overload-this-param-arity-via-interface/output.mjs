import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// interface method signatures too
interface I {
  pick(this: I, x: string): number[];
  pick(x: number): string;
}
declare const i: I;
export const viaInterface = _includesMaybeArray(_ref = i.pick('a')).call(_ref, 1);