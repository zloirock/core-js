import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// generic alias whose body wraps the type-param inside `T[]` - inner Array type
// resolves through to the array polyfill for `.at`
type G<T> = Generator<T[]>;
function* gen(): G<string> {
  yield ['x'];
}
for (const x of gen()) {
  _globalThis.__r = _atMaybeArray(x).call(x, 0);
  break;
}