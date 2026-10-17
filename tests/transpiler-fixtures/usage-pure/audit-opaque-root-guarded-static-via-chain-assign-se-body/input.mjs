// a CHAIN-ASSIGN root with an SE-carrying provable body folds BOTH effects (the write and the
// body) into the sequence prefix, exactly once, and the branch reads the ponyfill leaf
let heldSe, seBodyCount = 0;
const cse = () => { seBodyCount++; return globalThis; };
export const viaChainAssignSeBody = (heldSe = cse())?.self?.window?.Array.of(18).at(0);
