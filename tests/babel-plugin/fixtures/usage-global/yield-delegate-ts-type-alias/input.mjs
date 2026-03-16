type Inner = Generator<string, number[], void>;
declare const gen: Inner;
function* outer(): Generator<string, void, void> {
  const result = yield* gen;
  result.at(0);
}
