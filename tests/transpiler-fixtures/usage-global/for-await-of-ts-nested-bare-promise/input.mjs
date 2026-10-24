// @ts-expect-error a generic named without its type arguments is the shape under test
async function* gen(): AsyncGenerator<Promise<Promise>> {}
for await (const val of gen()) val.toFixed(2);
export {};
