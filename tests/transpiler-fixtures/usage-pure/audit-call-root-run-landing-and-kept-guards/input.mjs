// Proven call roots and identifier roots use the same realm-run landing.
// Delete-deciding optionals survive, and bound hop keys fold like dotted keys.
// A stored constructor value keeps its store while its redundant optional call guard disappears.
const dh = () => globalThis;
const bk = 'window';
let w;
let v;
delete dh().self.window?.a.keptGuardSlot;
delete dh()?.window.self.deadRootOptionalSlot;
delete dh().self[bk].boundKeyHopSlot;
export const boundHopFolds = dh().self[bk].a?.readSlot;
export const guardTestFolds = (w = dh().window.Array)?.from([]);
export const blockBodyRootProbe = (v = (function () { return globalThis; })().window.self.Promise)?.resolve(1);
export const stored = [typeof w, typeof v];
