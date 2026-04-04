declare const gen: Generator<string, number[], void>;
function* outer(): Generator<string, void, void> {
  const result = yield* gen;
  result.at(0);
}
