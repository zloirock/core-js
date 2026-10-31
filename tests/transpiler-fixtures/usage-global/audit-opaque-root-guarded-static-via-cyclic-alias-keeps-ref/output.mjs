import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// NEGATIVE: mutually-recursive wrappers never prove (the cycle guard stops the inline walk) -
// the chain keeps the raw guarded read off the ref
const cyc1 = () => cyc2();
const cyc2 = () => cyc1();
export const viaCyclicAliasKeepsRef = cyc1()?.window?.self?.Array.of(27).at(0);