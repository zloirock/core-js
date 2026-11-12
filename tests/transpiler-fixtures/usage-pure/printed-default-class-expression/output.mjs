import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A named default class expression must not create a module binding.
export default (class Hidden {
  read() {
    var _ref;
    return _atMaybeArray(_ref = [7]).call(_ref, 0);
  }
});
console.log(typeof Hidden);