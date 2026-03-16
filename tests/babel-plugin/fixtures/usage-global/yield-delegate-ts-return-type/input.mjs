function* inner(): Generator<string, number[], void> {
  yield 'hello';
  return [42];
}
function* outer(): Generator<string, void, void> {
  const result = yield* inner();
  result.at(0);
}
