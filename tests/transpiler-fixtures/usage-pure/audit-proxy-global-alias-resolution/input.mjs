// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering.
const { Promise: P } = [globalThis];
export const notSubstituted = () => P.resolve(1);

const M = [globalThis];
export const notSubstitutedWhole = () => M.resolve(1);

const [{ Map: MW }] = [globalThis];
export const stillResolves = new MW([[1, 2]]);

function _interopRequireDefault(m) { return m && m.__esModule ? m : { default: m }; }
var XW = _interopRequireDefault(require("@core-js/pure/actual/global-this"));
XW.default.Map.groupBy = function patched() { return 'p'; };
export const patchWins = XW.default.Map.groupBy([], x => x);
