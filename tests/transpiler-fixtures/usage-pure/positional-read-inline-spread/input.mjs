// every POSITIONAL read of a literal list expands an inline-array spread the same way: the type
// layer's element reads, the call-argument reads a return type follows, the presence of a slot
// value, the proxy-global pairing, a common element type. one method per row, so a row's narrowing
// is attributable to its own read; a spread of a BINDING leaves no static position past it
function pp({ x }) { return x; }
const viaPatternParam = pp(...[{ x: [1] }]);
viaPatternParam.at(0);
function dfl(a = [1]) { return a; }
const viaDefaultOverridden = dfl(...[[2]]);
viaDefaultOverridden.findLast(Boolean);
const [viaPresence = [1]] = [...[undefined]];
viaPresence.toSorted();
const [viaPresent = [1]] = [...[[2]]];
viaPresent.with(0, 1);
const viaMember = [...[[1]]][0];
viaMember.includes(1);
const [[viaNestedRead]] = [...[[[1]]]];
viaNestedRead.flatMap(x => x);
const { 0: { toSpliced: viaIndexKey } } = [...[[1]]];
const [{ Map: ViaProxy }] = [...[globalThis]];
new ViaProxy();
const [, { Set: ViaProxyShifted }] = [...[0, globalThis]];
new ViaProxyShifted();
for (const viaCommon of [...[[1], [2]]]) viaCommon.findLastIndex(Boolean);
for (const { x: viaMemberCommon } of [...[{ x: [1] }], { x: [2] }]) viaMemberCommon.toReversed();
const [viaTailSpread] = [...[[1]], ...wrapped];
viaTailSpread.keys();
export { viaPatternParam, viaDefaultOverridden, viaPresence, viaPresent, viaMember, viaNestedRead, viaIndexKey, viaTailSpread };

// the mutation census pairs the pattern at the same positions: the element an alias re-homes
// escapes through the inline spread as it does through the flat literal, and every element from a
// binding spread on escapes into any later slot (`values` / `entries` are the carriers)
const box = [[1]];
const [viaCensus] = [...[box]];
viaCensus.push('s');
box[0].values();
const [viaCensusShifted] = [...wrapped, box];
viaCensusShifted.push('s');
box[0].entries();
export { viaCensus, viaCensusShifted };

// NEGATIVES: a spread of a binding at or before the slot - no static position, the generic dispatch
const viaPatternParamAlias = pp(...wrapped);
viaPatternParamAlias.flat();
const viaDefaultAlias = dfl(...wrapped);
viaDefaultAlias.at(0);
const [viaShiftedAlias] = [...wrapped, [1]];
viaShiftedAlias.findLast(Boolean);
export { viaPatternParamAlias, viaDefaultAlias, viaShiftedAlias };
