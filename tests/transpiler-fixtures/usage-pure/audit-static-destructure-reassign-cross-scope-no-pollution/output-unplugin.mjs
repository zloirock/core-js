import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// two `from` bindings in distinct function scopes; only the first is reassigned. the
// reassignment record is keyed by name plus declaration source offset, so the second
// scope's `from` misses the first's entry and stays Array-narrowed (`_atMaybeArray`).
// without the scope-aware key both would share one entry and bail to generic `_at`.
function withReassign() {
  let from = _Array$from;
  function mutate() { from = (x) => x[0]; }
  mutate();
  const arr = from([1, 2]);
  return _at(arr).call(arr, 0);
}
function withoutReassign() {
  let from = _Array$from;
  const arr = from([3, 4]);
  return _atMaybeArray(arr).call(arr, 0);
}