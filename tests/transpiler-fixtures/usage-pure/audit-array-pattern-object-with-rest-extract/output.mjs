import _Array$from from "@core-js/pure/actual/array/from";
// A captured Array.from leaf retains its static polyfill and rest exclusion.
// Instance leaves under rest-bearing literal wrappers keep their native reads.
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
// The flat twin retains the same native instance read beside rest.
const {
  y: {
    at: viaFlatHopRename
  },
  ...flatRest
} = nb;
// a NEIGHBOUR element pairs by index, so the rename reads the element this pattern stands on
const [zLead, {
  y: {
    at: viaWrapSecondSlot
  },
  ...secondRest
}] = [1, nb];
export { viaWrapHopRename, wrapRest, viaFlatHopRename, flatRest, zLead, viaWrapSecondSlot, secondRest };