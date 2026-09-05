// a user default over a STATIC leaf is dead text: the extraction binds the polyfill's own import,
// which is never undefined, so the canon drops the guard on both legs at every depth and host -
// flat, aliased, assigned, exported, in a for-init, beside a rest, under a folding computed key, under
// a proxy hop, beside a data sibling, array-wrapped, and as a pattern default composing an instance
// leaf. an INSTANCE leaf keeps its guard: the dispatch result decides through `=== void 0`
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
