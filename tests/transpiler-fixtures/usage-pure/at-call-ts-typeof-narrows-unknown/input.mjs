// `unknown` parameter annotation must not suppress `typeof` narrowing -
// non-union annotations still participate in guard hint inference.
// expect `_atMaybeString` inside the `typeof x === 'string'` branch.
function f(x: unknown) {
  if (typeof x === 'string') return x.at(0);
}
