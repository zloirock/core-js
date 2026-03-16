async function* inner(): AsyncGenerator<string, number[], void> {
  yield 'hello';
  return [42];
}
async function* outer(): AsyncGenerator<string, void, void> {
  const result = yield* inner();
  result.at(0);
}
