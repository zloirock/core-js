import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// generic function: one regular param typed with `U`, followed by rest `T[]`. at the
// call site, `U` binds to the type of the first arg (`number`) and `T` binds to the type
// of subsequent args (`string`). return type resolves to `string`, so `.at(0)` routes to
// String-instance polyfill
function fn<T, U>(head: U, ...tail: T[]): T {
  return tail[0];
}
const s = fn(42, 'x', 'y');
_atMaybeString(s).call(s, 0);