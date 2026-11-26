// An async iterator can yield the raw PromiseLike object, including an array with its own then.
async function consume(itr: AsyncIterable<PromiseLike<string[]>>) {
  for await (const x of itr) {
    x.at(0);
  }
}
export { consume };
