import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A disabled getter stays after the earlier leaf default.
export function read({
  at,
  missing = effect(),
  // core-js-disable-next-line
  flat
} = (_ref => {
  return {
    get at() {
      return _atMaybeArray(_ref);
    },
    get missing() {
      return _ref.missing;
    },
    // core-js-disable-next-line
    get flat() {
      return _ref.flat;
    }
  };
})([3, 7])) {
  return [at, missing, flat];
}