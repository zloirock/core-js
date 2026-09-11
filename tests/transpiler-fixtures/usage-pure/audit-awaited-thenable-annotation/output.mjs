import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `for await ... of` peels PromiseLike the same way `await` peels Promise -
// each yielded `x` is the resolved `string[]`, dispatch must use array-narrowed `.at`
async function consume(itr: AsyncIterable<PromiseLike<string[]>>) {
  for await (const x of itr) {
    _atMaybeArray(x).call(x, 0);
  }
}
export { consume };