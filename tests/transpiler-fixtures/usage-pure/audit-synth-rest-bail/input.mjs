// synth-swap bails on RestElement in pattern: `{...rest} = Array` would lose the rest's
// runtime semantic if rewritten to `{...rest} = {key: _polyfill}` (rest gathers all OTHER
// own keys; with synth object the "other keys" set differs). findSynthSwapReceiver
// short-circuits on rest, falls back to inline-default. covers the rest-bail invariant
function f({ ...rest } = Array) { return rest; }
f();
