// The sync iterable yields a PromiseLike. The loop awaits it before reading the array's at method.
export async function first(source: Iterable<PromiseLike<number[]>>) {
  for await (const item of source) return item.at(0);
}
