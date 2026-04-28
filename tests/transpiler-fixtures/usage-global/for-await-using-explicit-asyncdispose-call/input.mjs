// stage-3 explicit-resource-management chain: `for await (await using r of asyncIter)`
// implicitly disposes via Symbol.asyncDispose, but user code may also explicitly invoke
// `r[Symbol.asyncDispose]()`. Both the for-await disposal scaffolding and the explicit
// computed-key call need their respective polyfills detected
async function main() {
  for await (await using r of asyncIter()) {
    await r[Symbol.asyncDispose]();
  }
}
