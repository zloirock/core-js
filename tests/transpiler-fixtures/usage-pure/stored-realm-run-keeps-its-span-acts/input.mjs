// Stored quiet realm runs retain their prefix, write and probe contracts.
// Effectful realm keys keep their source evaluation.
let c = 0;
let k = 0;

let seqStored;
export const seqPrefixAhead = (seqStored = (c++, globalThis).self.window?.Array)?.from([1]);

let root;
let writeStored;
export const writeUnderTheRun = (writeStored = (root = globalThis).self.window?.Promise)?.resolve(1);

let probeStored;
export const probeInsideTheSpan = (probeStored = globalThis.window?.self.Object)?.keys({});

let keyStored;
export const seKeyInsideTheSpan = (keyStored = (c++, globalThis).window?.[(k++, 'self')].Number)?.isInteger(1);

let plainStored;
export const plainSpanLandsWhole = (plainStored = globalThis.self.window?.Array)?.of(4);

export { c, k, root };
