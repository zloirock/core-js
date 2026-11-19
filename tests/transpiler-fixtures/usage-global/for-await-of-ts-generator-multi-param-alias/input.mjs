type MyAsyncGen<Y, R> = AsyncGenerator<Y, R>;
// @ts-expect-error a return the annotation does not admit is the shape under test
async function* gen(): MyAsyncGen<string, number> {}
async function f() {
  for await (const x of gen()) { x.at(0); }
}
