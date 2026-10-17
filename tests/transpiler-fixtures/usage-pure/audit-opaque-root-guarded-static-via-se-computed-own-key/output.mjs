import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// an SE-PREFIXED computed hop key still RESOLVES for the guard count: the memo composes with the
// probe rather than testing its result again, so ONE test stands and the effect rides the composed
// leaf into the branch - still once, still in source order after the window test
let keyEff = 0;
const sk = () => _globalThis;
export const viaSeComputedOwnKey = null == sk()?.window ? void 0 : _atMaybeArray(_ref = (keyEff++, _Array$of)(19)).call(_ref, 0);