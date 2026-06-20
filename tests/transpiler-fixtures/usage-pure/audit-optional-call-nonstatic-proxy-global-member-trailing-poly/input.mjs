// same defect through a proxy-global root: `globalThis.Map` resolves to the polyfillable Map, but
// `.notAMethod` is not a real static, so the `?.` guarding the call must survive. dropping it would
// call undefined and throw where native short-circuits to undefined
const r = globalThis.Map.notAMethod?.().at(0);
r;
