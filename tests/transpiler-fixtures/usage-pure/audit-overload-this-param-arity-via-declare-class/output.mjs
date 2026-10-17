import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
declare class C {
  m(this: C, x: string): number[];
  m(x: number): string;
}
declare const c: C;
export const viaDeclareClass = _atMaybeArray(_ref = c.m('a')).call(_ref, 1);