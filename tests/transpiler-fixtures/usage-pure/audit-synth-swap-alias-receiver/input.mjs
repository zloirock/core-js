// synthetic argument-receiver substitution where the receiver is an alias: the rewrite
// must preserve the alias binding, not inline the receiver expression twice.
const R = Array;
function g({ from, custom } = R) {
  return [from([1]), custom];
}
globalThis.__call = () => g({ from: () => [], custom: 'ok' });
