// `for await ... of` peels PromiseLike the same way `await` peels Promise -
// each yielded `x` is the resolved `string[]`, dispatch must use array-narrowed `.at`
async function consume(itr: AsyncIterable<PromiseLike<string[]>>) {
  for await (const x of itr) {
    x.at(0);
  }
}
export { consume };
