// `Extract<(A | B), Target>` with the source union wrapped in parens. oxc preserves
// TSParenthesizedType around the union (babel strips it during parsing); the resolver
// must peel before pattern-matching on TSUnionType, otherwise the single-member fallback
// loses the union and over-emits both array and string variants for `.at`. Distinct .at
// vs .toFixed per slot makes the narrow observable.
function foo(x: Extract<(string | number[]), number[]>) {
  x.at(-1);
}
function bar(y: Extract<(string | number), number>) {
  y.toFixed(2);
}
foo([1]);
bar(2);
