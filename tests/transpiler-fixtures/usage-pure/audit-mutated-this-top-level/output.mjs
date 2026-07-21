import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// top-level `this` IS the global proxy (the shared pragmatic canon): patches through it
// suppress substitution exactly like their `globalThis.` spellings
this.Array.from = function patched() {
  return [];
};
export const staticPatched = Array.from('ab');
this.Promise = class PatchedPromise {};
export const slotPatched = Promise.try(() => 1);
// method-scope `this` is an instance receiver, not the global - the read keeps its ponyfill
export class Helper {
  reset() {
    this.Map = {
      groupBy: null
    };
  }
}
export const control = _Map$groupBy([1], x => x);