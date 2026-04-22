import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// generator yielding a tuple wrapping the type-param: shallow subst would miss the
// `T[]` slot inside the tuple, leaving inner type unresolved. deep variant descends
type G<T> = Generator<[T, T[]]>;
function* gen(): G<number> {
  yield [0, [1, 2]];
}
for (const [first, list] of gen()) {
  _globalThis.__first = first;
  _globalThis.__list = _atMaybeArray(list).call(list, -1);
  break;
}