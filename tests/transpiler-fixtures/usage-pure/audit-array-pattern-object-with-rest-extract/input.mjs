// nested object destructure with rest gather inside a single-element array destructure.
// the consumed static extracts ahead of the host and is renamed in place; the residual
// array destructure (rest included) is KEPT, not re-wrapped, like the multi-element path,
// and rest still collects the receiver's remaining enumerable keys
const [{ from, ...rest }] = [Array];
from([1]);
rest;

// ... and a NESTED instance claim under that rest takes the HOP rename: the rest keeps the hop's
// key in the pattern, so what leaves is the hop's VALUE, renamed to the binding the dispatch reads.
// the wrapper is that host one literal out, and the element it pairs is the value the rename reads
const nb = { y: [3, [1, 2]], keep: 1 };
const [{ y: { at: viaWrapHopRename }, ...wrapRest }] = [nb];
// ... and the FLAT twin, whose shape this one now spells: the two hosts answer alike
const { y: { at: viaFlatHopRename }, ...flatRest } = nb;
// a NEIGHBOUR element pairs by index, so the rename reads the element this pattern stands on
const [zLead, { y: { at: viaWrapSecondSlot }, ...secondRest }] = [1, nb];
export { viaWrapHopRename, wrapRest, viaFlatHopRename, flatRest, zLead, viaWrapSecondSlot, secondRest };
