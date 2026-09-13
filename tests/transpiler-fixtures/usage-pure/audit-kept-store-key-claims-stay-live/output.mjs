import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// Claims inside a kept store's computed key survive the proxy fold and execute once.
// Plain window.self navigation stores the backed self value in value, plain-member
// and claimed-static consumers; key effects stay ahead of that store.
let held;
const keyLog = [];
export const storedKeyClaimValue = (held = (_pushMaybeArray(keyLog).call(keyLog, 1), _self))?.customQ;
export const storedKeyClaimPlain = String((held = (_pushMaybeArray(keyLog).call(keyLog, 2), _self)).customQ);
export const storedKeyClaimGuarded = (held = (_pushMaybeArray(keyLog).call(keyLog, 3), _self), _Array$of)(1);
export { held, keyLog };