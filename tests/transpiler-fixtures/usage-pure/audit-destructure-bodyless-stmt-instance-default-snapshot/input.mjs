// instance-method destructure with a default value inside a bodyless `if`. the deferred-emit
// path captures `scopeSnapshot` at visit time and replays via `scope tracker.genRef(snapshot)`
// at flush time; snapshot is intentionally scope-only (no bodyWrap), so `var _ref;` hoists
// to enclosing scope rather than producing a nested wrap around the flatten-emitted block.
if (cond) var { at = () => 0 } = getObj();
