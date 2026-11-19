// Call-produced slot values retain their effects before a for-of head binds them.
// Supported indirect-call statics resolve without replacing unrelated neighbouring values.
let n = 0;
const e = t => { n += t.length; return Object; };
const g = t => { n += t.length; return Array; };
const out = [];
for (const /* head binding */ { w: { entries: viaSole } } of [{ w: e('a') }]) /* body statement */ out.push(viaSole);
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
