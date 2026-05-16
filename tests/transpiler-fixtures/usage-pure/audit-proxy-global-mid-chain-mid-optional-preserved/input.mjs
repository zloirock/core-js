// `(globalThis?.X)?.Y.flat?.(0)` - mid-hop optional preservation. rebuild path drops `?.`
// at the leaf-adjacent hop (polyfill always defined) but MUST preserve `?.` at mid-hop
// (`?.Y` could still hit a nullish `_globalThis.X`). without per-hop optionality, rebuild
// would emit `_globalThis.X.Y` (lost optional) - any `_globalThis.X === undefined` case
// throws TypeError on `.Y` access instead of short-circuiting.
(globalThis?.X)?.Y.flat?.(0);
