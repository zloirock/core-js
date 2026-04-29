// non-emission lock: `[a, ...rest] = iter` rest-pattern destructure stays raw in pure
// mode; iterator-instance dispatch requires an `Iterator.from` anchor and is
// intentionally not auto-emitted.
const [a, ...rest] = arr;