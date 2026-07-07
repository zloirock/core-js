// a computed STRING-LITERAL key is as deterministic as the plain form: the pre-pass
// registers the ctor alias, so a member read inside an EARLIER-DEFINED closure still
// resolves (the guarded fold self-corrects at runtime); the late read folds directly
function early() { return M.groupBy(['a'], (x) => x); }
var { ['Map']: M } = globalThis;
export const viaEarly = early();
export const viaLate = M.groupBy(['b'], (x) => x);

// a const string-literal alias as the key resolves through the funnel's init-following
// canon - registration is not the only route for the LATE read
const pick = 'Set';
const { [pick]: S } = globalThis;
export const viaConstKey = typeof S;

// a genuinely DYNAMIC key (function parameter) stays unresolved - no registration, the
// read keeps the user value
function viaParam(key) { const { [key]: D } = globalThis; return typeof D; }
export const viaDynamic = viaParam('WeakSet');
