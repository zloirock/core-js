import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
namespace N {
  export const Array: any = null;
}
class C extends Array<number> {}
declare const c: C;
_atMaybeArray(c).call(c, 0);