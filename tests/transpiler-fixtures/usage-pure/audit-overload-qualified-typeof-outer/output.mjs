import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
declare namespace Outer {
  namespace Sub {
    function d(x: number): number[];
    function d(x: string): string;
  }
}
declare const call: typeof Outer.Sub.d;
_atMaybeString(_ref = call('ab')).call(_ref, 0);