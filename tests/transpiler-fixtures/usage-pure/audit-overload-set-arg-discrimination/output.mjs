import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3;
// an overload set is chosen by the arguments wherever it is declared: a namespace MERGED onto a
// class answers a static call like any other set instead of handing back its first declaration,
// and a written callable slot stands the whole set down - the replacement's value is described by
// no arm of it. the last row is the control: the same merged set with the other argument family
// selects the other arm
class Host {}
declare namespace Host {
  function make(a: string): string;
  function make(a: number): number[];
}
export const a = _atMaybeArray(_ref = Host.make(1)).call(_ref, 0);
class Written {
  static pick(a: string): string;
  static pick(a: number): number[];
  static pick(a: any): any {
    return a;
  }
}
Written.pick = () => "patched";
export const b = _at(_ref2 = Written.pick(1)).call(_ref2, 0);
export const c = _atMaybeString(_ref3 = Host.make("x")).call(_ref3, 0);