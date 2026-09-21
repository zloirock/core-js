import _Promise from "@core-js/pure/actual/promise";
// Rest requires the constructor index even without a separately named static.
const {
  Promise: {
    ...rest
  }
} = {
  Promise: _Promise
};
export { rest };