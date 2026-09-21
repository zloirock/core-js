// An inner receiver default serves only an undefined source slot.
// Known live slots are mirrored where safe; unknown or foreign slots keep native reads.
// Calls, loop elements, array wrappers and nested properties share that boundary.
const out = [];
const pick = () => ({ from: () => [7] });
for (const [{ from } = Array] of [[undefined]]) out.push(from([1]).length);
for (const [{ from } = Array, tail] of [[undefined, 1], [Array, 2]]) out.push(from([1]).length + tail);
for (const [{ from } = Array] of [[], [Array]]) out.push(from([1]).length);
for (const [[{ from } = Array]] of [[[undefined]]]) out.push(from([1]).length);
for (const { k: { from } = Array } of [{}, { k: Array }]) out.push(from([1]).length);
for (const { k: [{ from } = Array] } of [{ k: [undefined] }]) out.push(from([1]).length);
for (const [{ groupBy } = Map] of [[undefined]]) out.push(groupBy([1, 2], x => x % 2).size);
for (const [{ from } = Array] of [[pick()]]) out.push(from([1])[0]);
const src = [[undefined]];
for (const [{ from } = Array] of src) out.push(from([1]).length);
const [{ from: dynamicFrom } = Array] = [pick()];
const [{ from: dynamicSibling } = Array, count] = [pick(), 1];
const { k: { from: keyedFrom } = Array } = { k: Array };
const { k: { from: keyedAbsent } = Array } = { k: undefined };
for (const { k: { from } = Array } of [{ k: undefined }, { k: Array }]) out.push(from([1]).length);
let assigned;
[{ from: assigned } = Array] = [pick()];
try {
  throw [undefined];
} catch ([{ from: caught } = Array]) {
  out.push(caught([1]).length);
}
(({ k: { from } = Array }) => out.push(from([1]).length))({ k: Array });
const held = { from: () => [7] };
const [{ from: heldFrom } = Array] = [held];
export { out, dynamicFrom, dynamicSibling, count, keyedFrom, keyedAbsent, assigned, heldFrom };
