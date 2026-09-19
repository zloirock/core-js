// non-emission lock: `fn(...iter)` call spread stays raw in pure mode; iterator-
// instance dispatch driven by spread requires an `Iterator.from` anchor and is
// intentionally not auto-emitted.
fn(...args);