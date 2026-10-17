// two whole-ctor extractions off ONE declarator keep their own per-name registrations: each
// alias's STATIC read folds through its own hint (a single per-declarator entry let the second
// registration clobber the first, stranding the first alias's reads on the local name)
const [{ Symbol: SM }, { Promise: MG }] = [globalThis, globalThis];
export const viaMultiExtractSecond = MG.resolve(ready);
