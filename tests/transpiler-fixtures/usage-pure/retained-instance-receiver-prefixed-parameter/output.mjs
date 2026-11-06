import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A prefixed parameter default runs once before extracting its nested instance method.
// Caller-supplied objects retain their own properties and bypass the prefix.
let prefixes = 0;
function read(_ref = (prefixes++, {
  m: [1, [2]]
})) {
  let at = _atMaybeArray(_ref.m);
  return at;
}
console.log(read(), prefixes);