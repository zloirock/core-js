async function* gen(): AsyncGenerator<Promise<Promise>> {}
for await (const val of gen()) val.toFixed(2);
