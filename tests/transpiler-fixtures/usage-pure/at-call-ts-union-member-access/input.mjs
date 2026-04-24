// member access across a TSUnionType: recurse into each branch and fold. when any branch
// carries the property, use its annotation (lenient is the right call for polyfill hint
// inference). narrowing `x.kind === 'a'` selects the array leg. expect `_atMaybeArray`.
type X = { kind: 'a'; val: string[] } | { kind: 'b' };
function f(x: X) {
  if (x.kind === 'a') return x.val.at(0);
}
