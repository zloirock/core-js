// An array object is not its realm element: named properties of the array remain native.
// Positional bindings keep their own identity, and a patched imported realm slot wins over injection.
const { Promise: P } = [globalThis];
export const notSubstituted = () => P.resolve(1);

// a plain Identifier binding the whole array is no alias either
const M = [globalThis];
export const notSubstitutedWhole = () => M.resolve(1);

// A positional array pattern retains its own native constructor extraction.
const [{ Map: MW }] = [globalThis];
export const stillResolves = new MW([[1, 2]]);

// A patch through the interop default chain must remain visible to reads of that same realm slot.
function _interopRequireDefault(m) { return m && m.__esModule ? m : { default: m }; }
var XW = _interopRequireDefault(require("@core-js/pure/actual/global-this"));
XW.default.Map.groupBy = function patched() { return 'p'; };
export const patchWins = XW.default.Map.groupBy([], x => x);
