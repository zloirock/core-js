import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
namespace A.B.C {
  export interface MyArr extends Array<string> {}
}
declare const x: A.B.C.MyArr;
_atMaybeArray(x).call(x, 0);