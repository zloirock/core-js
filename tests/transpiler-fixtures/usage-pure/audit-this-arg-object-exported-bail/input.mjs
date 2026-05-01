// `export const o = {...}` makes the binding reachable from any importer; external
// writers leave the module surface, so the candidate set is unknown and we bail to
// the generic polyfill. mirrors the class-exported branch in `collectClassFieldCandidates`
export const o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
o.test();
