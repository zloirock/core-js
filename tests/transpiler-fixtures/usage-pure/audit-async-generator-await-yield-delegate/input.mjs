// `yield* await inner()` in an async generator: the delegate AST is AwaitExpression
// wrapping the call. resolveGeneratorTypeParam peeled paren / chain / TS only - the
// AwaitExpression survived and the CallExpression branch missed. peel one Await layer
// so the call's return-type signature reaches the AsyncGenerator-typed dispatcher.
// observable target is the `yield*` expression VALUE (delegate's TReturn): `result.at`
// narrows to the array polyfill when delegate's TReturn binds to string[]
function inner(): AsyncGenerator<unknown, string[]> {
  return null as any;
}
async function* outer() {
  const result = yield* await inner();
  result.at(0);
}
outer();
