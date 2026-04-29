// non-emission lock: `for await (const x of iter)` stays raw in pure mode; async-
// iteration protocol dispatch requires an `Iterator.from` anchor and is intentionally
// not auto-emitted.
async function f() {
  for await (const x of asyncIter) {}
}