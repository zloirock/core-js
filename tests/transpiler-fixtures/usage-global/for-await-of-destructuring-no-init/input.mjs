async function f() { for await (const { includes } of asyncIter) { includes("x"); } }
