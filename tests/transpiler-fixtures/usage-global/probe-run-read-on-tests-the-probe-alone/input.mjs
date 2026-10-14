// a guarded receiver reading a probe run on tests the environment probe alone: every realm hop
// past the probe names the realm the probe read, so a second test of one re-tests the same value -
// with a backed hop after it or none, and through a seal. a member of its own `?.` past the run
// is a value of its own
export const noBackedHop = globalThis.window?.window?.Array.of(2).flat();
export const unbackedOverBacked = globalThis.window?.self.window?.Array.from([3]).findLast(x => x);
export const deepRun = globalThis.window?.window?.window?.Object.values({ v: 4 }).includes(4);
export const plainReadOff = globalThis.window?.window?.box.at(0);
export const sealedRun = (globalThis.window?.self.window)?.Object.entries({ e: 5 }).flatMap(x => x);
export const ownOptional = globalThis.window?.window?.list?.findLastIndex(x => x);
