import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// A stored realm selected by a ternary keeps both the write and its Promise static.
// The resolve call injects its static entry rather than only the constructor.
let held;
export const result = (true ? held = _globalThis : _globalThis, _Promise$resolve)(2);
export { held };