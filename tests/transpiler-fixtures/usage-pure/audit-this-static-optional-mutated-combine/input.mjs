// a user-PATCHED inherited static must not deopt through the optional rescue: the patch owns
// the slot, so no pure static injects and the chain-combine keeps the guard - the raw method-GET
// dispatches to the patch at runtime while the trailing instance methods still polyfill.
// bailing to the standalone path instead would strand the two trailing polys as overlapping
// rewrites over the shared guard (composition crash). the gate is PER-KEY: the sibling
// `super.of?.()` chain (of is NOT patched) still deoptimizes to the injected static
Array.from = function (x) { return [8]; };
class C extends Array {
  static viaPatched() {
    return this.from?.([1, 2]).flat().at(0);
  }
  static viaUnpatched() {
    return super.of?.(1, 2).flat().at(0);
  }
}
export const r = [C.viaPatched(), C.viaUnpatched()];
