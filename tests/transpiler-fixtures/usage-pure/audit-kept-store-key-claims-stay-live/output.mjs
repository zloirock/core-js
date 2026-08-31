import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a claim inside a kept store's computed key stays live through the render: the key container
// rides by identity, so the polyfill lands in place - in the VALUE form (nothing above reads
// the store's absence, the fold replays the key ahead of the leaf) and in the GUARDED form
// alike (a claim above renders the test that reads the store, the key spelled inside it)
let held;
const keyLog = [];
export const storedKeyClaimValue = (held = (_pushMaybeArray(keyLog).call(keyLog, 1), _self))?.customQ;
export const storedKeyClaimPlain = String((held = (_pushMaybeArray(keyLog).call(keyLog, 2), _self)).customQ);
export const storedKeyClaimGuarded = null == (held = null == _globalThis[_pushMaybeArray(keyLog).call(keyLog, 3), 'window'] ? void 0 : _self) ? void 0 : _Array$of(1);
export { held, keyLog };