// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const [{ from, ...rest }] = [Array];
from([1]);
rest;

const nb = { y: [3, [1, 2]], keep: 1 };
const [{ y: { at: viaWrapHopRename }, ...wrapRest }] = [nb];
// ... and the FLAT twin, whose shape this one now spells: the two hosts answer alike
const { y: { at: viaFlatHopRename }, ...flatRest } = nb;
// a NEIGHBOUR element pairs by index, so the rename reads the element this pattern stands on
const [zLead, { y: { at: viaWrapSecondSlot }, ...secondRest }] = [1, nb];
export { viaWrapHopRename, wrapRest, viaFlatHopRename, flatRest, zLead, viaWrapSecondSlot, secondRest };
