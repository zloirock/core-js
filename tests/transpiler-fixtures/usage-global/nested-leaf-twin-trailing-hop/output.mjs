import "core-js/modules/es.array.at";
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
  before,
  data: {
    at: method,
    length
  }
} = source;
use(before, method, length);