import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// a BOUND computed hop key names its slot on every host the consume reaches - the declaration (a
// ctor and an instance leaf), the followed alias, the identifier init, the loop head and the catch
// clause - exactly as the literal spelling does; a wrapper standing UNDER the key pairs its slot
// like one standing over it, on the declaration and the assignment host alike
const hopSlot = 'w';
function viaBoundHopHeads(list) {
  const out = [];
  for (const _ref of list) {
    const headAt = _at(_ref.w);
    _pushMaybeArray(out).call(out, headAt);
  }
  const thrown = new Error('x');
  thrown.w = [10];
  try {
    throw thrown;
  } catch (_ref2) {
    let caughtAt = _at(_ref2.w);
    _pushMaybeArray(out).call(out, caughtAt);
  }
  return out;
}
export default [viaBoundHopHeads([{
  w: [9]
}])];