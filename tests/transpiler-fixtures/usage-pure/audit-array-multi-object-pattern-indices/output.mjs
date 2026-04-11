import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const [{
  a
}, {
  b
}] = [{
  a: "x"
}, {
  b: [1]
}];
_atMaybeString(a).call(a, 0);
_includesMaybeArray(b).call(b, 1);