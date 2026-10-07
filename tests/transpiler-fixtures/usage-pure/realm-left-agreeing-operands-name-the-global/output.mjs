import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _self from "@core-js/pure/actual/self";
var _ref;
// A `||` / `??` whose every operand names one global, its last one never nullish - a bare name, which throws
// where the engine lacks the global - yields that global whichever operand runs, so a member or `in` read over it
// takes the static's pure entry though the build decides nothing (`Map` excluded); a pattern reads the left's static
// on its own route either way. A last operand that may be nullish, an alias anywhere - its own walk, asked at every
// level of an alias chain, is the exponential class - and an `&&` keep it native; operands naming different globals
// keep the selection too, an `Object` arm's static served through the identity guard.
const list = [1, 2];
export const viaMember = _Map$groupBy(list, x => x);
export const viaIn = true;
const viaPattern = _Map$groupBy;
export { viaPattern };
export const viaChain = _Map$groupBy(list, x => x);
export const nullishLast = (_globalThis.Map ?? _self.Map).groupBy(list, x => x);
export const disagreeing = (_ref = _globalThis.Map ?? Object, _ref === Object ? _Object$groupBy(list, x => x) : _ref.groupBy(list, x => x));
const AliasMap = Map;
export const aliasLast = (_globalThis.Map ?? AliasMap).groupBy(list, x => x);
const RealmMap = _globalThis.Map;
export const aliasOperand = (RealmMap ?? Map).groupBy(list, x => x);
export const both = (_globalThis.Map && Map).groupBy(list, x => x);