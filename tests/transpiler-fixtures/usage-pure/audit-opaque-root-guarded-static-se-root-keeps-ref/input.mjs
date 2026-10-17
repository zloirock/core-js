// A sequence prefix at the chain root runs its effect exactly once in the guard test.
// The guarded branch then reads the static ponyfill.
let seCount = 0;
const eff = () => seCount++;
const k = () => globalThis;
export const seRootKeepsRef = (eff(), k())?.window?.Array.of(6).at(0);
