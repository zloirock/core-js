// the root binding a deleted navigation folds onto lands in the slot the run's own claim would take,
// the TS wrapper written over the run included: the bare binding needs no assertion
const realm = () => globalThis;
export const castOverTheRun = delete (realm().window.self as any).castSlot;
export const nonNullOverTheRun = delete realm().window.self!.nonNullSlot;
