// a pattern-valued leaf (`of: { name }`) receives the polyfill VALUE in the mirrored default
// and destructures it natively - reading the polyfill's own properties is ordinary
// polyfill-wins behavior, same as any member read on a polyfilled static
function f({ Array: { from, of: { name } } } = globalThis) {
  return [from, name];
}
f();
