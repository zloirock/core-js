// `function f({groupBy} = Object)` - Object is a global proxy receiver. Receiver-rewrite
// replaces the default with `{groupBy: _Object$groupBy}` so that when the caller omits
// the arg the polyfill is invoked, and when the caller passes a custom object the
// override semantics are preserved (default not evaluated)
function pickGroupBy({ groupBy } = Object) { return groupBy; }
function pickFromEntries({ fromEntries } = Object) { return fromEntries; }
export { pickGroupBy, pickFromEntries };
