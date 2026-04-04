type MyAsyncGen<T> = AsyncGenerator<T>;
async function* gen(): MyAsyncGen<string> {}
async function f() {
  for await (const x of gen()) { x.at(0); }
}
