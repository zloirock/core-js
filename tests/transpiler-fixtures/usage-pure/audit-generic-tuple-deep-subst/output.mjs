import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// generator yielding a tuple with a nested `T[]` slot — inner Array type resolves
// through for `list.at(...)` polyfill
type G<T> = Generator<[T, T[]]>;
function* gen(): G<number> {
  yield [0, [1, 2]];
}
for (const [first, list] of gen()) {
  _globalThis.__first = first;
  _globalThis.__list = _atMaybeArray(list).call(list, -1);
  break;
}