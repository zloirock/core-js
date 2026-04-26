// TS type predicate routed via a variable type annotation: the predicate flow must
// still narrow the type for downstream polyfill rewrites.
const isStr: (x: unknown) => x is string = (x) => typeof x === 'string';
function test(x: unknown) {
  if (isStr(x)) x.at(-1);
}
test('hi');
