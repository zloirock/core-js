import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Independent claims in a retained realm key execute once before the source store.
// The stored value and sealed reads keep their native behavior.
let held;
const keyLog = [];
export const storedKeyClaimValue = (held = _globalThis[_pushMaybeArray(keyLog).call(keyLog, 1), 'window'].self)?.customQ;
export const storedKeyClaimPlain = String((held = _globalThis[_pushMaybeArray(keyLog).call(keyLog, 2), 'window'].self).customQ);
export const storedKeyClaimGuarded = (held = _globalThis[_pushMaybeArray(keyLog).call(keyLog, 3), 'window'].self)?.Array.of(1);
export { held, keyLog };