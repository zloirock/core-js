// an EXPORTED lagged alias resolves through the export wrapper the same as a plain one, while the
// realm's `Map` it holds until the reassignment leaves through the export: the file takes the whole entry
export let E;
({ Map: E } = globalThis);
E = [9];
export const r5 = E.toSpliced(0, 1);
