import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// the ELEMENT routes bind the dispatch IN PLACE of the slot, so a DEFAULTED claim has no arm left to
// run - and the dispatch does not stand in for it: a receiver carrying no such method answers
// `undefined` where the source answers its own default. the pattern stays native there, and the
// relocation that would have hosted it stands down with it; the undefaulted twin below is served
const seen = [];
for (const [{
  at: viaDefault = fb
}] of [[{}]]) _pushMaybeArray(seen).call(seen, viaDefault === fb);
for (const _ref2 of [[[1, 2]]]) {
  let [_ref] = _ref2;
  let viaPlain = _at(_ref);
  _pushMaybeArray(seen).call(seen, typeof viaPlain);
}
export { seen };