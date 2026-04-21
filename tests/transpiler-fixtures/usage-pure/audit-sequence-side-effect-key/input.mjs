// `Symbol[(fn(), 'iterator')]` — SequenceExpression computed key with a side-effecting
// preceding element. `extractSequenceEffects` pulls `fn()` out as a sideEffects entry on
// the member-meta; emission wraps the polyfill id in a source-level sequence so fn()
// still runs before `_Symbol$iterator` is read, without collapsing the whole access to
// just the polyfill (which would silently drop fn())
Symbol[(fn(), 'iterator')];
