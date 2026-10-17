import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// ... and the receiver needs no re-readable token of its own: the hop step spells it ONCE, inside
// its own dispatch, so a CALL and a literal compose exactly like a binding - and the claim INSIDE
// such a receiver keeps its own step, because the spelling is read LIVE rather than copied at
// registration (a copy taken before that rewrite dropped the inner `slice`)
const viaCall = mk();
const fromCall = _nameMaybeFunction((_ref = _at(viaCall)) === void 0 ? {} : _ref);
export { fromCall };