import _at from "@core-js/pure/actual/instance/at";
// `const alias = o` makes `alias` an alias of `o`, so the write `alias.arr = "..."` must be
// folded into the candidate union as String (via scope-binding identity, not binding name).
// `Array<Number>` + String has no common type -> generic `_at` emits. without alias tracing
// the write is invisible and the unsound `_atMaybeArray` crashes when arr is a string (TypeError).
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