// two `from` bindings in distinct function scopes; only the first is reassigned. the
// reassignedBindings Map keys by `${name}@${start}`, where start is the declaration
// identifier's source offset. the second function's `from` lookup uses its own
// declaration position, misses the first's entry, and narrows the return type to
// Array -- without the scope-aware key both bindings would share a bare `from`
// entry and the resolver would conservatively bail to generic dispatch
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
