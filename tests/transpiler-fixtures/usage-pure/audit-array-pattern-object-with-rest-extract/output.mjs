import _Array$from from "@core-js/pure/actual/array/from";
// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order.
const [,] = [Array];
const from = _Array$from;
const {
  from: _unused,
  ...rest
} = Array;
from([1]);
rest;
const nb = {
  y: [3, [1, 2]],
  keep: 1
};
const [{
  y: {
    at: viaWrapHopRename
  },
  ...wrapRest
}] = [nb];
const {
  y: {
    at: viaFlatHopRename
  },
  ...flatRest
} = nb;
const [zLead, {
  y: {
    at: viaWrapSecondSlot
  },
  ...secondRest
}] = [1, nb];
export { viaWrapHopRename, wrapRest, viaFlatHopRename, flatRest, zLead, viaWrapSecondSlot, secondRest };