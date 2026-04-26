// `for await (const x of iter)`: the async-iteration protocol must be polyfilled.
async function f() {
  for await (const x of asyncIter) {}
}
