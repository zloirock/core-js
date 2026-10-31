import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// NEGATIVE: the callee alias captured the SOURCE before its reassignment - the reassigned
// source bails and the chain keeps the raw guarded read (the capture holds whatever the
// program put there)
let swapMk = () => ({
  window: null
});
const heldMk = swapMk;
swapMk = () => globalThis;
export const viaReassignedSourceCallee = heldMk()?.window?.self?.Array.of(35).at(0);