// A chain-assignment root keeps its write in the guard test while the static still collapses.
let held;
const ca = () => globalThis;
export const viaChainAssignRoot = (held = ca())?.window?.Array.of(7).at(0);
