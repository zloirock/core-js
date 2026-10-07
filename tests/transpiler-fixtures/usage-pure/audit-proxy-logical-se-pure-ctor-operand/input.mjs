// A side-effect-prefixed pure-constructor proxy-global operand in a LOGICAL receiver: the leaf lookup
// must peel the SE tail to recognise the pure ctor, then leave the operand verbatim so the natural
// visitor whole-swaps its tail (`(effect(), globalThis.self.Map)` -> `(effect(), _Map)`), preserving
// the SE prefix. Rewriting it in place dropped the prefix or crashed the transform. A decided selection
// folds to the operand; right of an undecided left the operand swaps in place.
function effect() {
  return 0;
}
const { groupBy, ...rest } = (effect(), globalThis.self.Map) || Set;
groupBy([], item => item);
const { groupBy: viaRight, ...others } = maybe || (effect(), globalThis.self.Map);
viaRight([], item => item);
