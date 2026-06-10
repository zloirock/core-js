// a parameter default with an effect prefix beside the receiver read: the prefix is KEPT
// (re-emitted ahead of the literal, runs on the no-argument call exactly as native) and only
// the effect-free receiver tail is replaced by the mirrored literal
const log = [];
function f({ Array: { from } } = (log.push(1), globalThis)) {
  return [from, log.length];
}
f();
