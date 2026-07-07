// usage-global twin: the computed string-literal ctor alias registers in the pre-pass, so
// the early member read through it injects its module like the plain form
function early() { return M.groupBy(['a'], (x) => x); }
var { ['Map']: M } = globalThis;
export const viaEarly = early();
