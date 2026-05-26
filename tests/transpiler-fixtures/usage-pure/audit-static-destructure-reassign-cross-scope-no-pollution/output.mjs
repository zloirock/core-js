import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
// two `from` bindings in distinct function scopes; only the first is reassigned. the
// reassignedBindings Map keys by `${name}@${start}`, where start is the declaration
// identifier's source offset. the second function's `from` lookup uses its own
// declaration position, misses the first's entry, and narrows the return type to
// Array -- without the scope-aware key both bindings would share a bare `from`
// entry and the resolver would conservatively bail to generic dispatch
function withReassign() {
  let from = _Array$from;
  function mutate() {
    from = x => x[0];
  }
  mutate();
  const arr = from([1, 2]);
  return _at(arr).call(arr, 0);
}
function withoutReassign() {
  let from = _Array$from;
  const arr = from([3, 4]);
  return _atMaybeArray(arr).call(arr, 0);
}