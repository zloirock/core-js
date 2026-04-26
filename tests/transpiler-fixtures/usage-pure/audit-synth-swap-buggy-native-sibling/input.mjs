// synthetic argument-receiver substitution next to a buggy-native-detected sibling:
// each sibling rewrites independently without interfering.
function f({ resolve, custom } = Promise) {
  return [resolve(1), custom];
}
globalThis.__call = () => f({ resolve: x => x, custom: 'ok' });
