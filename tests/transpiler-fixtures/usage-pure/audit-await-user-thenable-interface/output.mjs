import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// interface-shaped Thenable (not class). same structural rule: `await x` peels to the
// callback's first-arg type per Thenable contract. T = number[] flows through to `arr`,
// narrow Array dispatch fires for both `.at(0)` and `.includes(1)`
interface MyThenable<T> {
  then(cb: (v: T) => any, e?: any): MyThenable<T>;
}
declare const t: MyThenable<number[]>;
async function go() {
  const arr = await t;
  _atMaybeArray(arr).call(arr, 0);
  _includesMaybeArray(arr).call(arr, 1);
}
go();