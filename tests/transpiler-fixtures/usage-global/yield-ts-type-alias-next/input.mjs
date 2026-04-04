type MyGen = Generator<string, void, number[]>;
function* gen(): MyGen {
  const next = yield 'hello';
  next.at(0);
}
