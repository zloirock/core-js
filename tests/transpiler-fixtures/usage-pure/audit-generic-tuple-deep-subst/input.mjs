// generator yielding a tuple wrapping the type-param: shallow subst would miss the
// `T[]` slot inside the tuple, leaving inner type unresolved. deep variant descends
type G<T> = Generator<[T, T[]]>;
function* gen(): G<number> { yield [0, [1, 2]]; }
for (const [first, list] of gen()) {
  globalThis.__first = first;
  globalThis.__list = list.at(-1);
  break;
}
