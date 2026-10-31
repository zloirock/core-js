import _Object$create from "@core-js/pure/actual/object/create";
import _Promise from "@core-js/pure/actual/promise";
let fRe, rRe;
({
  Promise: {
    allSettled: fRe,
    ...rRe
  }
} = {
  Promise: _Promise
});
export const crD = _Object$create;
export { fRe };
export { rRe };