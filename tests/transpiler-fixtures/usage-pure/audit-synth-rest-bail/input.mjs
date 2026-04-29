// receiver-rewrite bails on a rest element in the pattern: `{...rest} = Array` would
// lose the rest's runtime semantic if rewritten to `{...rest} = {key: _polyfill}` (rest
// gathers all OTHER own keys; with a synthetic object the "other keys" set differs).
// The receiver-rewrite check short-circuits on rest and falls back to per-key destructure
// default. Covers the rest-bail invariant
function f({ ...rest } = Array) { return rest; }
f();
