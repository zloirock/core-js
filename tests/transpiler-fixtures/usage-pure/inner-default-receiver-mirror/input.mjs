// A receiver-bearing INNER default (`[{ from } = Array]`, `{ k: { from } = Array }`) names the arm the
// outer slot leaves open, and the live arm is whatever the slot holds. Where the host spells the live
// receiver - the iterated elements of a for-x head, an IIFE argument, a literal init - the shared plan
// mirrors both arms: every defined element in place, and the default itself for the passes whose slot
// provably holds `undefined` (absent key, hole, a key spelled `undefined`). A slot nothing proves (a call) keeps its
// native read and only the default is swapped, so a user object arriving there survives; a slot that
// proves a value (a binding holding the user's literal) never fires the default, which stays as
// written; a slot the pairing proves `undefined` still takes the declaration rename. Both legs read
// one plan.
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
