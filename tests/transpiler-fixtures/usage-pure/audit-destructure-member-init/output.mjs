import _at from "@core-js/pure/actual/instance/at";
const _ref = obj.prop;
const at = _at(_ref);
// destructuring from a property access (not a call) with one instance-method property
// (`at`) plus a remaining unknown property - init must be memoized to a temp so both
// the instance polyfill and the remaining destructure see the same receiver
const {
  nope
} = _ref;