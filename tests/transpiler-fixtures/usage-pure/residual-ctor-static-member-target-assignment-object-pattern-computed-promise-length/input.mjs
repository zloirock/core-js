// ... and a COMPUTED key extracts where it FOLDS to the static's name (`[k]` with `const k = 'race'`,
// `['race']`, a template); a key carrying an EFFECT keeps the residual, which is where that effect
// still has to run, and the slot reads natively there
const k = 'race';
let viaAssign;
({ Promise: { [k]: { length: viaAssign } } } = globalThis);
export const r = [viaAssign];
