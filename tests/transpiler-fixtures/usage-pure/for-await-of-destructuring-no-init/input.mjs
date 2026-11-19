// a `for await` head relocates like any other: the async iteration's element types nothing, so the
// claim off it is the dispatcher, and the relocated declaration is where it binds
async function f() { for await (const { includes } of asyncIter) { includes("x"); } }
