// Known static imports are defined, so their user defaults remain dead.
// Instance leaves still test the dispatch result before choosing a fallback.
const fb = 0;
const K = 'from';
function k() { return 'from'; }
const { from: viaAlias = fb } = Array;
const { of = fb } = Array;
let viaAssign;
({ from: viaAssign = fb } = Array);
export const { isArray: viaExport = fb } = Array;
for (const { from: viaForInit = fb } = Array; ;) { viaForInit; break; }
const { from: viaRestSibling = fb, ...restOf } = Array;
const { [K]: viaComputed = fb } = Array;
const { [K]: viaComputedSibling = fb, of: ofBeside } = Array;
const { ['from']: viaStringKey = fb } = Array;
const { Array: { from: viaHop = fb } } = globalThis;
const { Array: { [K]: viaHopComputed = fb } } = globalThis;
const { w: { Array: { from: viaBesideSibling = fb } }, z } = { w: globalThis, z: 1 };
const [{ from: viaWrapped = fb }] = [Array];
const { of: { name: viaPatternDefault } = {} } = Array;
let viaAssignPatternDefault;
({ from: { name: viaAssignPatternDefault } = {} } = Array);
const { Array: { of: { name: viaHopPatternDefault } = {} } = {} } = globalThis;
const { at: viaInstance = fb } = [1];
const { [k()]: viaSeKey = fb } = Array;
export {
  viaAlias, of, viaAssign, viaRestSibling, restOf, viaComputed, viaComputedSibling, ofBeside, viaStringKey,
  viaHop, viaHopComputed, viaBesideSibling, z, viaWrapped, viaPatternDefault, viaAssignPatternDefault,
  viaHopPatternDefault, viaInstance, viaSeKey,
};
