const isStr: (x: unknown) => x is string = (x) => typeof x === 'string';
function test(x: unknown) {
  if (isStr(x)) x.at(-1);
}
test('hi');
