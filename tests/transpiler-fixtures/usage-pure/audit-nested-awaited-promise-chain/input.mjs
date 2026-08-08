// nested `Awaited<Awaited<...>>` over `Promise<Promise<T>>` must unwrap fully through
// the recursive Promise-collapse so dispatch sees the inner Array
async function fn() {
  const r: Awaited<Awaited<Promise<Promise<number[]>>>> = [] as any;
  r.at(0);
}
