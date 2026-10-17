// an SE computed KEY combined with an SE CALL root in ONE sealed probe: the guard test owns
// the single call run, the alternate owns the single key run (native order test-key-read)
let cc1 = 0, kc1 = 0;
const dheCombo = () => { cc1++; return globalThis; };
export const viaSeKeySeCallRoot = (dheCombo().window?.[(kc1++, 'self')]).Array.of(5).at(0);
export { cc1 };
export { kc1 };
