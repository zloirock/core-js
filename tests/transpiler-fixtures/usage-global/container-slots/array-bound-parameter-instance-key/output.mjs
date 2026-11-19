import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// Const-bound computed keys preserve the Array and String families of parameter defaults.
// Distinct shared methods expose each receiver type independently in the imports.
const constBoundComputedInstanceKey = function () {
  const KEY = 'at';
  return function ({
    [KEY]: f
  } = [3, [4]]) {
    return f;
  }();
}();
const constBoundComputedStringKey = function () {
  const KEY = 'includes';
  return function ({
    [KEY]: f
  } = '34') {
    return f;
  }();
}();
export { constBoundComputedInstanceKey, constBoundComputedStringKey };