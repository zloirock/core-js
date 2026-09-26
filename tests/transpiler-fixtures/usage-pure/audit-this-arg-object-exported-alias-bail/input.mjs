// `export const alias = o` exposes the closure binding through an alias importers can mutate.
// Closure narrow on `this.arr` must be abandoned because the export channel is an alias-leak path.
const o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
export const alias = o;
o.test();
