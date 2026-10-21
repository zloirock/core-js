import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// An effectful realm key stays behind its source optional test.
// The sealed read still throws on an absent realm; its nested key claim stays live.
const effects = [];
export const value = (_globalThis.window?.[_pushMaybeArray(effects).call(effects, 'key'), 'self']).customQ;
export { effects };