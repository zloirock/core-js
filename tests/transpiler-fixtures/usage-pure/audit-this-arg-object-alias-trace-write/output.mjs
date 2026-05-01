import _at from "@core-js/pure/actual/instance/at";
// `const alias = o` adds `alias` to the alias closure of `o`. the write `alias.arr = ...`
// is then matched (via scope-binding identity) and folded into the candidate union as
// String. commonType(Array<Number>, String) collapses to null -> generic `_at` emits.
// without alias tracing the write would be invisible (binding name mismatch) and narrow
// would unsoundly emit `_atMaybeArray`, which on old engines crashes when arr is a string
// (`it.at` is undefined, `.call` on undefined throws TypeError)
const o = {
  arr: [1, 2, 3],
  test() {
    var _ref;
    return _at(_ref = this.arr).call(_ref, 0);
  }
};
const alias = o;
alias.arr = "stringified";
o.test();