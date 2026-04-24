// arrow IIFE synth-swap mirrors the param-default path: arrow has no `arguments` and the
// ObjectPattern (no rest) destructures only specific keys, so replacing the arg identifier
// with `{from: _Array$from, ...}` can't leak into the body. inline-array spread `...[Array]`
// exposes an indexable element - we splice the synth into the literal at that slot.
// non-literal spread `...rest` bails since the static index is unknown
(({ from }) => from)(...[Array]);
(({ from }) => from)(...rest);
