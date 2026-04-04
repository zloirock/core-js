async function* gen(): AsyncGenerator<string[]> { yield ["x"]; }
async function f() { for await (const x of gen()) { x.at(0); } }
