import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const from = _Array$from;
// nested object destructure with rest gather inside a single-element array destructure.
// the consumed static extracts ahead of the host and is renamed in place; the residual
// array destructure (rest included) is KEPT, not re-wrapped, like the multi-element path,
// and rest still collects the receiver's remaining enumerable keys
const [{
  from: _unused,
  ...rest
}] = [Array];
from([1]);
rest;

// ... and a NESTED instance claim under that rest takes the HOP rename: the rest keeps the hop's
// key in the pattern, so what leaves is the hop's VALUE, renamed to the binding the dispatch reads.
// the wrapper is that host one literal out, and the element it pairs is the value the rename reads
const nb = {
  y: [3, [1, 2]],
  keep: 1
};
const [{
  y: _ref,
  ...wrapRest
}] = [nb];
// ... and the FLAT twin, whose shape this one now spells: the two hosts answer alike
const viaWrapHopRename = _atMaybeArray(_ref);
const {
  y: _ref2,
  ...flatRest
} = nb;
// a NEIGHBOUR element pairs by index, so the rename reads the element this pattern stands on
const viaFlatHopRename = _atMaybeArray(_ref2);
const [zLead, {
  y: _ref3,
  ...secondRest
}] = [1, nb];
const viaWrapSecondSlot = _atMaybeArray(_ref3);
export { viaWrapHopRename, wrapRest, viaFlatHopRename, flatRest, zLead, viaWrapSecondSlot, secondRest };