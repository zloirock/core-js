// A tagged-template tag is a this-carrying invocation: the runtime ctor guard's raw branch
// must bind the receiver exactly like a call callee, or the raw method runs with
// `this = undefined` instead of the alias.
function viaTag(c) {
  let M;
  c ? ({ Map: M } = globalThis) : 0;
  return M.groupBy`items`;
}
// a sequence-detached tag drops `this` natively - the raw branch must stay unbound
function viaDetachedTag(c) {
  let P;
  c ? ({ Promise: P } = globalThis) : 0;
  return (0, P.withResolvers)`x`;
}
// a paren-wrapped tag keeps the reference natively - binds like the bare form
function viaWrappedTag(c) {
  let A;
  c ? ({ Array: A } = globalThis) : 0;
  return (A.from)`ab`;
}
// a bracket-key tag resolves the same static slot and binds the same way
function viaBracketTag(c) {
  let P;
  c ? ({ Promise: P } = globalThis) : 0;
  return P['try']`x`;
}
export const r = [viaTag, viaDetachedTag, viaWrappedTag, viaBracketTag];
