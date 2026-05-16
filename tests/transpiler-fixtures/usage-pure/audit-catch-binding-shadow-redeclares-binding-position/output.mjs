// catch-binding `{ from }` (no receiver / rest / computed / default) whose body declares
// a NAMED FUNCTION EXPRESSION `function from()` -- the NFE id slot is a BINDING POSITION,
// not a reference to the catch-bound `from`. babel-plugin's `extractCatchClause` walker
// uses both `isNonReferencePosition` AND `isBindingPosition` filters; the NFE id is
// skipped, the catch param has no real references, no extraction is performed. unplugin's
// equivalent walker in `handleDestructuringPure` now mirrors the filter pair (currently
// unreachable due to receiver-gating in the catch path, but kept symmetric so future
// top-level catch processors inherit correct behavior). regression guard: catch left
// as-is, no `_ref` extraction even though `from` is lexically Array.from's name.
try {
  someCall();
} catch ({
  from
}) {
  const fn = function from() {
    return [1];
  };
  fn();
}