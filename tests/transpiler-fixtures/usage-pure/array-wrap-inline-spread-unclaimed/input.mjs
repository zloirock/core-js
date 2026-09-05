// a file whose inline-array spreads are flattened for the routes and then CLAIMED BY NONE prints
// as written: the splice is undone once the file is known to inject nothing, so the leg that
// reprints its tree agrees with the leg that hands the source back
function viaParamDefault([{ y: { at: a } }] = [...[nb]]) { return a; }
class K { f = (([{ y: { at: b } }]) => b)([...[nb]]); }
const [{ z }] = [...[nb]];
export { viaParamDefault, K, z };
