import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// outer computed-key carrying a side effect (`[(eff(), 'includes')]`): the effect folds into the
// combine's conditional alternate so it fires only when the chain does NOT short-circuit - native
// skips the key eval on a nullish receiver, so it runs once on a hit and never on a miss. both
// plugins combine the computed-key outer identically (no output divergence)
null == arr || null == (_ref = _at(arr)) || null == (_ref2 = _ref.call(arr, 0)) ? void 0 : (eff(), _includes(_ref2).call(_ref2, 1));