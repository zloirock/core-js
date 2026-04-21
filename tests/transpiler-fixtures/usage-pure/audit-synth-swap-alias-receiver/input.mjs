const R = Array;
function g({ from, custom } = R) {
  return [from([1]), custom];
}
globalThis.__call = () => g({ from: () => [], custom: 'ok' });
