import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `Array<T>` container form for rest annotation - innerTypeParamName handles both T[] and Array<T>
function fn<T>(...xs: Array<T>): T {
  return xs[0];
}
const s = fn('hello');
_atMaybeString(s).call(s, 0);