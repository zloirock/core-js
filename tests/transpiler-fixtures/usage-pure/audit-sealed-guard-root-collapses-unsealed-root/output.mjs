import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// NEGATIVE: no seal, so the whole navigation collapses and the claim needs no guard at all
export const unsealedRoot = _Promise$resolve(1);