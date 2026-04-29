import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// `function f({groupBy} = Object)` - Object is a global proxy receiver. Receiver-rewrite
// replaces the default with `{groupBy: _Object$groupBy}` so that when the caller omits
// the arg the polyfill is invoked, and when the caller passes a custom object the
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