import _Array$of from "@core-js/pure/actual/array/of";
import _Object$entries from "@core-js/pure/actual/object/entries";
// Nested literal spreads retain exact positions, including empty arrays and holes.
// Declarations keep their native patterns. The call and for-of resolve Object.entries and Array.of.
const [{
  values
}] = [...[...[Object]]];
const [, {
  from
}] = [...[...[],, ...[Array]]];
const entries = (({
  entries: read
}) => read)(...[...[{
  entries: _Object$entries
}]]);
export { values, from, entries };
for (const {
  of: read
} of [...[...[(effect(), {
  of: _Array$of
})]]]) read(7);