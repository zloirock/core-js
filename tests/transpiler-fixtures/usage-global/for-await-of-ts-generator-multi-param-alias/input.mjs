type MyAsyncGen<Y, R> = AsyncGenerator<Y, R>;
async function* gen(): MyAsyncGen<string, number> {}
async function f() {
  for await (const x of gen()) { x.at(0); }
}
