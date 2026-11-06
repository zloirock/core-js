// two `from` bindings in distinct function scopes; only the first is reassigned. the
// reassignment record is keyed by name plus declaration source offset, so the second
// scope's `from` misses the first's entry and stays Array-narrowed (`_atMaybeArray`).
// without the scope-aware key both would share one entry and bail to generic `_at`.
function withReassign() {
  let { from } = Array;
  function mutate() { from = (x) => x[0]; }
  mutate();
  const arr = from([1, 2]);
  return arr.at(0);
}
function withoutReassign() {
  let { from } = Array;
  const arr = from([3, 4]);
  return arr.at(0);
}
