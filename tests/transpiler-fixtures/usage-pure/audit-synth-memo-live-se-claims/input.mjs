// a claim INSIDE the harvested se of a synth-swap memo argument lands during the walk, and
// the DRAIN re-harvests the live container: a registration-captured ref goes stale the
// moment the in-place claim REPLACES its node, and the frozen clone re-emitted the raw
// spelling (`getObj().at(0)` reached the memo arg unpolyfilled). the sibling locks the
// param-ref numbering around the same channel.
let tick = 0;
function keyClaim({ groupBy: gb, more } = globalThis[(getObj().at(0), "self")].Map) { return [gb, more]; }
keyClaim();
function refOrder({ groupBy: gb2, more2 } = globalThis[(tick++, "self")].Map, z = getObj().at(0)) { return [gb2, more2, z]; }
refOrder();
// ... and the PROXY-plan branch of the same channel re-plans at drain too: the
// registration-time render of `(effects, root).Array` froze the raw effects while their
// landed rewrites died with the discarded original (imports pruned as unreferenced)
const log = [];
function proxyBranch({ from: x, nope: y } = globalThis[(log.push([3].at(0)), "self")].Array) { return [typeof x, typeof y, log[0]]; }
use(proxyBranch());
