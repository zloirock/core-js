// `const alias = o` adds `alias` to the alias closure of `o`. the write `alias.arr = ...`
// is then matched (via scope-binding identity) and folded into the candidate union as
// String. commonType(Array<Number>, String) collapses to null -> generic `_at` emits.
// without alias tracing the write would be invisible (binding name mismatch) and narrow
// would unsoundly emit `_atMaybeArray`, which on old engines crashes when arr is a string
// (`it.at` is undefined, `.call` on undefined throws TypeError)
const o = {
  arr: [1, 2, 3],
  test() {
    return this.arr.at(0);
  }
};
const alias = o;
alias.arr = "stringified";
o.test();
