// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
// a write through the head's own binding lands AFTER the iterable was read: a head reads its source
// once per ENTRY, so the literal the element spells is what every pass of that entry binds
const throughHead = { w: Array };
for (const { from } of [throughHead.w]) {
  throughHead.w = Map;
  out.push(typeof from);
}
export { out };
