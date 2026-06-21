// `yield* await inner()` in an async generator: the delegate is an AwaitExpression wrapping
// the call. resolving the delegate type must peel one Await layer (on top of paren / chain /
// TS) so the call's return signature reaches the AsyncGenerator dispatcher. observable target
// is the `yield*` VALUE (delegate's TReturn): `result.at` narrows to the array polyfill when
// the delegate's TReturn binds to string[]
function inner(): AsyncGenerator<unknown, string[]> {
  return null as any;
}
async function* outer() {
  const result = yield* await inner();
  result.at(0);
}
outer();
