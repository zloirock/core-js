import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A proven non-colliding string key keeps the ordinary default mirror available.
const key = 'length';
export function read({
  at,
  [key]: other
} = function (_ref) {
  return null == _ref ? _ref : {
    at: _atMaybeArray(_ref),
    get [key]() {
      return _ref[key];
    }
  };
}([7])) {
  return [at, other];
}