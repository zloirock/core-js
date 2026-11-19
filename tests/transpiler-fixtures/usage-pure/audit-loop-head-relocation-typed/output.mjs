import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// ... and the element's TYPE travels too, stashed on the minted name before the rewrite: without it
// the loop variable reads as unknown, and the claim would ship the generic dispatcher
const typed = function () {
  let seen;
  for (let _ref of [[1, 2]]) {
    let at = _atMaybeArray(_ref);
    seen = at;
  }
  return seen;
}();
export { typed };