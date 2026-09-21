import _Array$of from "@core-js/pure/actual/array/of";
import _Promise from "@core-js/pure/actual/promise";
// The constructor rest reads its index beside a sibling that extracts one static.
const {
  Promise: {
    race,
    ...rest
  },
  Array: {
    of
  }
} = {
  Promise: _Promise,
  Array: {
    of: _Array$of
  }
};
export { race, rest, of };