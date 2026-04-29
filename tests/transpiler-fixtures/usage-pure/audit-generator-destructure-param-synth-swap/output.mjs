import _Array$from from "@core-js/pure/actual/array/from";
// generator function destructure default + receiver-rewrite. The plugin builds a
// synthetic `{ from: _Array$from }` object literal in place of the `Array` default;
// the generator function body wrapper does not block the rewrite. `yield` receives
// the same runtime binding as if it had been written inline
function* g({
  from
} = {
  from: _Array$from
}) {
  yield from([1]);
}
g();