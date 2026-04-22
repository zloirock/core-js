// generator yielding a tuple with a nested `T[]` slot — inner Array type resolves
// through for `list.at(...)` polyfill
type G<T> = Generator<[T, T[]]>;
function* gen(): G<number> { yield [0, [1, 2]]; }
for (const [first, list] of gen()) {
  globalThis.__first = first;
  globalThis.__list = list.at(-1);
  break;
}
