// Catch's ArrayPattern with nested default and rest — no extraction: positional bindings
// can't benefit from property-rewrite, so babel mirrors unplugin and leaves the pattern
// inline. `.at` / `.flat` polyfill against the named locals unchanged
try {} catch ([a = {inner: 42}, ...rest]) { a.at(0); rest.flat(); }
