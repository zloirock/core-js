// A stored constructor's full-entry requirement follows prefixes, stores, aliases and selections.
// Rest-bearing patterns still read the actual constructor held by each container.
let spellingHits = 0;
const prefixed = (spellingHits++, { Map });
const { Map: { groupBy: viaPrefix }, ...prefixRest } = prefixed;
let sharedSlot;
const chained = sharedSlot = { Map };
const { Map: { groupBy: viaChain }, ...chainRest } = chained;
const hopSource = { Map };
const hopped = hopSource;
const { Map: { groupBy: viaHop }, ...hopRest } = hopped;
const leftArm = { Map };
const rightArm = { Map };
const armed = leftArm || rightArm;
const { Map: { groupBy: viaArms }, ...armsRest } = armed;
const indexedSource = [Map];
const indexedHop = indexedSource;
const [{ groupBy: viaIndexHop, ...indexHopRest }] = indexedHop;
// ... and the spelling alone widens nothing: a name holding a literal whose slot stores no
// constructor asks the entry for nothing, and the read stays exactly where the source wrote it
const plainSource = { Map: {} };
const plainHop = plainSource;
const { Map: { groupBy: viaPlainSlot }, ...plainRest } = plainHop;
export { viaPrefix, viaChain, viaHop, viaArms, viaIndexHop, viaPlainSlot };
export { prefixRest, chainRest, hopRest, armsRest, indexHopRest, plainRest, spellingHits, sharedSlot };
