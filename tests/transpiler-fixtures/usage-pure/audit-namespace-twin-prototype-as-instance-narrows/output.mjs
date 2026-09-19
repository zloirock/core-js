import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
namespace N {
  export const Array: any = null;
}
const {
  prototype: P
} = Array;
export const r = _atMaybeArray(P).call(P, 0);