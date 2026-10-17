import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
let logical = 0;
logical ||= null == _globalThis.window ? void 0 : _Number$MAX_SAFE_INTEGER;
export { logical };