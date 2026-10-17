import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _globalThis from "@core-js/pure/actual/global-this";
// a kept root re-emits itself, so it must not ALSO be harvested as an effect (the assignment would run
// twice) - but only it is exempt. an effect the sequence around it carries is not the assignment and must
// still ride ahead, in source order
let sc = 0;
let sq;
export const seAroundKeptRoot = null == (sc++, sq = _globalThis.window) ? void 0 : _findIndexMaybeArray(sq.Array.prototype).call([1], x => x);
export { sc };