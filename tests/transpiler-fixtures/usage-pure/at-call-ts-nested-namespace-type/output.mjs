import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
namespace A.B {
  export interface MyArr extends Array<string> {}
}
declare const x: A.B.MyArr;
_atMaybeArray(x).call(x, 0);