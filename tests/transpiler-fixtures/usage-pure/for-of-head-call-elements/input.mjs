// a for-of head over a literal whose elements hold a CALL typed to return a constructor: the leaf
// under the hop reads that constructor's STATIC on every pass (`_Object$entries`), never the
// instance dispatcher that answers `undefined` where the native static is absent. the head binding
// carries no init - the walk reads the iterated element as the init it would have had - and calls of
// the same named function count as one element for a reader that resolves them, while a mirror
// never writes into a call (the source pattern keeps an inline default there). differing callees
// stay generic; a member read off the head binding in the body resolves the same way
let n = 0;
const e = t => { n += t.length; return Object; };
const g = t => { n += t.length; return Array; };
const out = [];
for (const { w: { entries: viaSole } } of [{ w: e('a') }]) out.push(viaSole);
for (const { w: { entries: viaSibling }, at } of [{ w: e('a'), at: e('b') }]) out.push(viaSibling, at);
for (const { w: { is: viaTwoSameCalls } } of [{ w: e('a') }, { w: e('b') }]) out.push(viaTwoSameCalls);
for (const { w: { is: viaDifferentCallees } } of [{ w: e('a') }, { w: g('b') }]) out.push(viaDifferentCallees);
for (const item of [{ w: e('a') }]) {
  const { w: { keys: viaBodyDestructure } } = item;
  out.push(viaBodyDestructure);
}
for (const item of [{ w: e('a') }, { w: e('b') }]) {
  const viaBodyMember = item.w.entries;
  out.push(viaBodyMember);
}
for (const item of [{ w: Object }]) {
  item.w = Array;
  const viaWrittenSlot = item.w.entries;
  out.push(viaWrittenSlot);
}
export { out, n };
