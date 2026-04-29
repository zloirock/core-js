// non-emission lock: `[...iter]` array spread stays raw in pure mode; iterator-instance
// dispatch driven by spread requires an `Iterator.from` anchor and is intentionally
// not auto-emitted.
const a = [...arr];
