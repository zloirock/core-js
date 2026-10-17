import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Const-bound computed keys preserve the Array and String families of parameter defaults.
// Distinct shared methods expose each receiver type independently in the imports.
const constBoundComputedInstanceKey = function () {
  const KEY = 'at';
  return function ({
    [KEY]: f
  } = {
    at: _atMaybeArray([3, [4]])
  }) {
    return f;
  }();
}();
const constBoundComputedStringKey = function () {
  const KEY = 'includes';
  return function ({
    [KEY]: f
  } = {
    includes: _includesMaybeString('34')
  }) {
    return f;
  }();
}();
export { constBoundComputedInstanceKey, constBoundComputedStringKey };