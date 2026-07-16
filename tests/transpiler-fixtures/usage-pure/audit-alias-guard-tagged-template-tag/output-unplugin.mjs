import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A tagged-template tag is a this-carrying invocation: the runtime ctor guard's raw branch
// must bind the receiver exactly like a call callee, or the raw method runs with
// `this = undefined` instead of the alias.
function viaTag(c) {
  let M;
  c ? ({ Map: M } = _globalThis) : 0;
  return (M === _Map ? _Map$groupBy : M.groupBy.bind(M))`items`;
}
// a sequence-detached tag drops `this` natively - the raw branch must stay unbound
function viaDetachedTag(c) {
  let P;
  c ? ({ Promise: P } = _globalThis) : 0;
  return (0, (P === _Promise ? _Promise$withResolvers : P.withResolvers))`x`;
}
// a paren-wrapped tag keeps the reference natively - binds like the bare form
function viaWrappedTag(c) {
  let A;
  c ? ({ Array: A } = _globalThis) : 0;
  return ((A === Array ? _Array$from : A.from.bind(A)))`ab`;
}
// a bracket-key tag resolves the same static slot and binds the same way
function viaBracketTag(c) {
  let P;
  c ? ({ Promise: P } = _globalThis) : 0;
  return (P === _Promise ? _Promise$try : P['try'].bind(P))`x`;
}
export const r = [viaTag, viaDetachedTag, viaWrappedTag, viaBracketTag];