import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref;
// A `||` / `??` whose every operand names one global, its last one never nullish - a bare name, which throws
// where the engine lacks the global - yields that global whichever operand runs, so a member or `in` read over it
// takes the static's pure entry though its left decides nothing (a probe of `window`, absent off-window); a
// pattern reads the left's static on its own route either way. An alias as the last operand - its own walk, asked
// at every level of an alias chain, is the exponential class - and an `&&` keep the selection; so do operands
// naming different globals, an `Object` arm's static served through the identity guard.
const list = [1, 2];
export const viaMember = _Map$groupBy(list, x => x);
export const viaIn = true;
const {
  groupBy: viaPattern
} = (null == _globalThis.window ? void 0 : {
  groupBy: _Map$groupBy
}) ?? {
  groupBy: _Map$groupBy
};
export { viaPattern };
export const viaChain = _Map$groupBy(list, x => x);
export const disagreeing = (_ref = (null == _globalThis.window ? void 0 : _Map) ?? Object, _ref === Object ? _Object$groupBy(list, x => x) : _ref.groupBy(list, x => x));
const AliasMap = _Map;
export const aliasLast = ((null == _globalThis.window ? void 0 : _Map) ?? AliasMap).groupBy(list, x => x);
export const both = ((null == _globalThis.window ? void 0 : _Map) && _Map).groupBy(list, x => x);