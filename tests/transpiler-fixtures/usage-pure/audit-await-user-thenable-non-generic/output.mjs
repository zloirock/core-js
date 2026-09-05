import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// non-generic Thenable: class with no type-params, callback's first-arg annotation is a
// concrete type directly. `arr` resolves to `number[]` without any substitution step.
// narrow Array dispatch fires
class Box {
  then(cb: (v: number[]) => any, _e?: any): Box {
    return this;
  }
}
declare const b: Box;
async function go() {
  const arr = await b;
  _atMaybeArray(arr).call(arr, 0);
  _includesMaybeArray(arr).call(arr, 1);
}
go();