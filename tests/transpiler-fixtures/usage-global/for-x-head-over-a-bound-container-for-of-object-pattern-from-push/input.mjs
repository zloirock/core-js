// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
const W = { w: Array };
for (const { from, of } of [W.w]) out.push(typeof from, typeof of);
export { out };
