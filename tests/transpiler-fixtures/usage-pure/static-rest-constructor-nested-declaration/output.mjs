import _Promise from "@core-js/pure/actual/promise";
// A nested constructor rest reads named properties from the same pure index.
const {
  Promise: {
    all,
    ...rest
  }
} = {
  Promise: _Promise
};
export { all, rest };