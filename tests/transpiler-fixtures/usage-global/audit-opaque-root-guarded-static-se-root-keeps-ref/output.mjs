import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// an SE-carrying sequence at the chain root: the memo assignment runs the effect exactly once
// in the guard test, so the branch reads the ponyfill leaf
let seCount = 0;
const eff = () => seCount++;
const k = () => globalThis;
export const seRootKeepsRef = (eff(), k())?.window?.Array.of(6).at(0);