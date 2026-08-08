// non-emission lock: array-pattern destructure of an iterable stays raw in pure mode;
// iterator-instance dispatch requires an `Iterator.from` anchor and is intentionally
// not auto-emitted.
const [a, b] = arr;