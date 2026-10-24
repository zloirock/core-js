// a pattern-valued leaf (`of: { name }`) DESCENDS in the mirrored default: the slot spells the
// pattern's own keys off the static's ponyfill, so a leaf carrying a claim of its own is dispatched
// there (`of: { name: _nameMaybeFunction(_Array$of) }`) instead of being read natively off the
// polyfill value - the claim is a real one on engines with no `Function.prototype.name`
function f({ Array: { from, of: { name } } } = globalThis) {
  return [from, name];
}
f();
