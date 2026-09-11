// a ternary param default over proxy aliases unfolds BOTH branches into mirrored literals -
// the runtime test stays native and the polyfill binds on either selection
let c = true;
function f({ Array: { from } } = c ? globalThis : self) {
  return from;
}
export { f };
