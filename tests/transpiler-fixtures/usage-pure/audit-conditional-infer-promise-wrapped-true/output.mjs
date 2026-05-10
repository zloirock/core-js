import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// infer-element with Promise-wrapped trueType: `T extends (infer U)[] ? Promise<U> : never`
// inferred element must propagate into Promise<U> awaited resolution
type ToPromise<T> = T extends (infer U)[] ? Promise<U[]> : never;
declare const p: ToPromise<number[][]>;
async function read() {
  const arr = await p;
  _atMaybeArray(arr).call(arr, 0);
}
read();