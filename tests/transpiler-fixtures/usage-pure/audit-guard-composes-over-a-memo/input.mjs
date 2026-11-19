// a nav that collapses to a ponyfill under ONE probe owes no memo: the probe is the test and the
// claim reads the always-defined leaf inside the alternate, where a memo would spell a second test
// over the first. the negatives keep theirs - a value with a spelling that must run exactly once
// (a kept write, an effect-bearing sequence, an unknown binding) is what a memo exists for
let held, cb;
let se = 0;
const ga = globalThis;
export const composesOverTheProbe = ga.window?.self?.Array.prototype.at.name;
export const composesUnderACall = ga.window?.self?.Array.of(1).at(0);
export const keptWriteMemoizes = (held = ga.window)?.self?.Array.of(2).at(0);
export const sequenceMemoizes = (se++, ga.window?.self)?.Array.of(3).at(0);
export const openBindingMemoizes = cb?.self?.Array.of(4).at(0);
export { held, cb, se };
