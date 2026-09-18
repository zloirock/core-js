// The obligation a stored constructor puts on the entry follows the container however the file
// SPELLS it, not only where the literal stands bare in the declarator: an effect ahead of the value,
// a chain assignment through it, a name holding it, a selection between two names that each hold
// one. Every one of these reads the same stored constructor, so every one owes the wide entry -
// the narrow module carries none of the ctor's own statics, and object-rest exposes that by
// stopping the extraction at the level of the read.
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
