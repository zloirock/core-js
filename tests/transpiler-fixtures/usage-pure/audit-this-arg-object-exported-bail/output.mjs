import _at from "@core-js/pure/actual/instance/at";
// `export const o = {...}` makes the binding reachable from any importer; external
// writers leave the module surface, so the candidate set is unknown and we bail to
// the generic polyfill. mirrors the class-exported branch in `collectClassFieldCandidates`
export const o = {
  arr: [1, 2, 3],
  test() {
    var _ref;
    return _at(_ref = this.arr).call(_ref, 0);
  }
};
o.test();