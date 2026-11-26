import _at from "@core-js/pure/actual/instance/at";
// An async iterator can yield the raw PromiseLike object, including an array with its own then.
async function consume(itr: AsyncIterable<PromiseLike<string[]>>) {
  for await (const x of itr) {
    _at(x).call(x, 0);
  }
}
export { consume };