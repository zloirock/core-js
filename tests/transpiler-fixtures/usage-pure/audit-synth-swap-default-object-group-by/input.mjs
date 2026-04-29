// `function f({groupBy} = Object)` - Object is a global proxy receiver. plugin
// rewrites the default to `{groupBy: _Object$groupBy}` synth-swap so that when caller
// omits the arg the polyfill is invoked, and when caller passes a custom object the
// override semantics are preserved (default not evaluated)
function pickGroupBy({ groupBy } = Object) { return groupBy; }
function pickFromEntries({ fromEntries } = Object) { return fromEntries; }
export { pickGroupBy, pickFromEntries };
