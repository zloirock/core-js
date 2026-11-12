import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A named default expression owns its name locally; printing must not hoist a declaration.
const hidden = 1;
export default (function hidden() {
  var _ref;
  return _atMaybeArray(_ref = [7]).call(_ref, 0);
});
console.log(hidden);