// alias-trace win: `const alias = o` adds `alias` to closure but `alias.arr` is a read,
// not a write. write scan finds zero matching writes, candidates stay [Array<Number>],
// narrow proceeds to `_atMaybeArray`. demonstrates the precision benefit of trace-through
// over bail-on-any-alias - read-only aliasing patterns keep their narrow
const o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
const alias = o;
console.log(alias.arr.length);
o.test();
