// A memoized fallback can serve multiple instance leaves with one invocation.
// Its result is captured once before the two method reads.
export function read(box) {
  function use({ y: { at, includes } = fallback() } = { y: box.list }) { return [at, includes]; }
  return use();
}
