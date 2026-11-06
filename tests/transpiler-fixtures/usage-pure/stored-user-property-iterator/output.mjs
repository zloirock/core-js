import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
// The iterator call receives the user's self object, with the store evaluated once.
let held;
export const value = _getIterator((held = _globalThis.host).self).next().value;
export { held };