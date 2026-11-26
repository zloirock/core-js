type Done<T> = (...args: [value: T]) => void;
interface Task { then(cb: Done<{ text: string }> | null): void }
export function read(value: Awaited<Task>) {
  return value.text.at(0);
}
export async function first(source: Iterable<PromiseLike<number[]>>) {
  for await (const item of source) return item.at(0);
}
export async function lastName(source: AsyncIterable<Promise<{ name: string }>>) {
  for await (const { name } of source) return name.at(-1)?.toUpperCase();
}
