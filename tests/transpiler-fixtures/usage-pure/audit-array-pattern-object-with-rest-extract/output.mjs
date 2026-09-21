import _Array$from from "@core-js/pure/actual/array/from";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const [_ref] = [Array],
  _ref2 = _ref,
  from = null == _ref2 ? _ref2[""] : _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref2;
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
// ... and the FLAT twin, whose shape this one now spells: the two hosts answer alike
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