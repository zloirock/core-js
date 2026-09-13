// A nested loop slot reads statics from the constructors returned by its element calls.
// Equal receivers permit direct extraction; differing callees retain an identity guard.
// Every call and its effects remain in the iterable.
// A member read off the head binding resolves the same receiver.
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
