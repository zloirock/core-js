import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// `function f({groupBy} = Object)` - Object is a global proxy receiver. plugin
// rewrites the default to `{groupBy: _Object$groupBy}` synth-swap so that when caller
// omits the arg the polyfill is invoked, and when caller passes a custom object the
// override semantics are preserved (default not evaluated)
function pickGroupBy({
  groupBy
} = {
  groupBy: _Object$groupBy
}) {
  return groupBy;
}
function pickFromEntries({
  fromEntries
} = {
  fromEntries: _Object$fromEntries
}) {
  return fromEntries;
}
export { pickGroupBy, pickFromEntries };