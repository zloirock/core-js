import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// user-defined Thenable class with structural `.then(cb: (v: T) => any)` shape. per TS
// spec `await x` resolves to T per Thenable contract. with class type-arg T = string[],
// `arr` narrows to string[] and `.at(0)` dispatches the array-narrow polyfill
class MyThenable<T> {
  then(_cb: (v: T) => any, _e?: any): MyThenable<T> {
    return this;
  }
}
declare const t: MyThenable<string[]>;
async function go() {
  const arr = await t;
  _atMaybeArray(arr).call(arr, 0);
}
go();