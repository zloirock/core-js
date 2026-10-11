// a deleted navigation lands its ROOT binding however the source wraps a hop: a cast, a non-null
// assertion or a sequence standing between two hops is still inside the run, so a call root folds
// onto the root ponyfill like the paren twin does - not onto the hop written above the wrapper
const realm = () => globalThis;
export const castBetweenHops = delete (realm().window as any).self.castSlot;
export const nonNullBetweenHops = delete realm().window!.self.nonNullSlot;
export const sequenceBetweenHops = delete (0, realm().window).self.sequenceSlot;
