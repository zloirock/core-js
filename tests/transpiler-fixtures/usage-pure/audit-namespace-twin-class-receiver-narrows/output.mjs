import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
class C extends Array<number> {}
namespace N {
  class C {}
}
declare const c: C;
export const r = _flatMaybeArray(c).call(c);