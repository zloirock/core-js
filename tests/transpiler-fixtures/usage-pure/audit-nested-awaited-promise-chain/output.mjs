import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// nested `Awaited<Awaited<...>>` over `Promise<Promise<T>>` must unwrap fully through
// the recursive Promise-collapse so dispatch sees the inner Array
async function fn() {
  const r: Awaited<Awaited<Promise<Promise<number[]>>>> = [] as any;
  _atMaybeArray(r).call(r, 0);
}