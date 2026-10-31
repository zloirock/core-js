import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A preceding outer getter must run before the nested leaf's shared hop.
// The length read stays on that same value.
const source = {
  get before() {
    effect('before');
    return 1;
  },
  get data() {
    effect('hop');
    return [4, 9];
  }
};
const {
    before
  } = source,
  {
    data: _ref
  } = source,
  method = _atMaybeArray(_ref),
  {
    length
  } = _ref;
use(before, method, length);