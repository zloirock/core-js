import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `await t` where t's annotation is a qualified-name TSTypeReference `NS.MyThenable<T>`.
// the structural Thenable peel must accept qualified names, not only bare Identifier ones;
// rejecting them drops the narrow on `arr` so `arr.at(0)` emits generic _at. accepting them
// lands the narrow on the then-callback's first param (string[]) so `.at(0)` emits _atMaybeArray
namespace NS {
  export class MyThenable<T> {
    then(_cb: (v: T) => any, _e?: any): MyThenable<T> {
      return this;
    }
  }
}
declare const t: NS.MyThenable<string[]>;
async function go() {
  const arr = await t;
  _atMaybeArray(arr).call(arr, 0);
}
go();