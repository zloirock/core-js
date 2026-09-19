import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
class C extends Array<number> {}
namespace N {
  class C {}
}
declare const c: C;
export const r = _atMaybeArray(c).call(c, 0);