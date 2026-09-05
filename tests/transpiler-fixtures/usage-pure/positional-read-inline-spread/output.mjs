import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref2, _ref3;
// every POSITIONAL read of a literal list expands an inline-array spread the same way: the type
// layer's element reads, the call-argument reads a return type follows, the presence of a slot
// value, the proxy-global pairing, a common element type. one method per row, so a row's narrowing
// is attributable to its own read; a spread of a BINDING leaves no static position past it
function pp({
  x
}) {
  return x;
}
const viaPatternParam = pp(...[{
  x: [1]
}]);
_atMaybeArray(viaPatternParam).call(viaPatternParam, 0);
function dfl(a = [1]) {
  return a;
}
const viaDefaultOverridden = dfl(...[[2]]);
_findLastMaybeArray(viaDefaultOverridden).call(viaDefaultOverridden, Boolean);
const [viaPresence = [1]] = [...[undefined]];
_toSortedMaybeArray(viaPresence).call(viaPresence);
const [viaPresent = [1]] = [...[[2]]];
_withMaybeArray(viaPresent).call(viaPresent, 0, 1);
const viaMember = [...[[1]]][0];
_includesMaybeArray(viaMember).call(viaMember, 1);
const [[viaNestedRead]] = [...[[[1]]]];
_flatMapMaybeArray(viaNestedRead).call(viaNestedRead, x => x);
const _ref = [1];
const viaIndexKey = _toSplicedMaybeArray(_ref);
const {
  0: {
    toSpliced: _unused
  }
} = [...[_ref]];
const ViaProxy = _Map;
new ViaProxy();
const ViaProxyShifted = _Set;
const [, {
  Set: _unused2
}] = [0, _globalThis];
new ViaProxyShifted();
for (const viaCommon of [...[[1], [2]]]) _findLastIndexMaybeArray(viaCommon).call(viaCommon, Boolean);
for (const {
  x: viaMemberCommon
} of [...[{
  x: [1]
}], {
  x: [2]
}]) _toReversedMaybeArray(viaMemberCommon).call(viaMemberCommon);
const [viaTailSpread] = [...[[1]], ...wrapped];
_keysMaybeArray(viaTailSpread).call(viaTailSpread);
export { viaPatternParam, viaDefaultOverridden, viaPresence, viaPresent, viaMember, viaNestedRead, viaIndexKey, viaTailSpread };

// the mutation census pairs the pattern at the same positions: the element an alias re-homes
// escapes through the inline spread as it does through the flat literal, and every element from a
// binding spread on escapes into any later slot (`values` / `entries` are the carriers)
const box = [[1]];
const [viaCensus] = [...[box]];
_pushMaybeArray(viaCensus).call(viaCensus, 's');
_values(_ref2 = box[0]).call(_ref2);
const [viaCensusShifted] = [...wrapped, box];
_pushMaybeArray(viaCensusShifted).call(viaCensusShifted, 's');
_entries(_ref3 = box[0]).call(_ref3);
export { viaCensus, viaCensusShifted };

// NEGATIVES: a spread of a binding at or before the slot - no static position, the generic dispatch
const viaPatternParamAlias = pp(...wrapped);
_flatMaybeArray(viaPatternParamAlias).call(viaPatternParamAlias);
const viaDefaultAlias = dfl(...wrapped);
_at(viaDefaultAlias).call(viaDefaultAlias, 0);
const [viaShiftedAlias] = [...wrapped, [1]];
_findLastMaybeArray(viaShiftedAlias).call(viaShiftedAlias, Boolean);
export { viaPatternParamAlias, viaDefaultAlias, viaShiftedAlias };