// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
// NEGATIVE: a slot the source WRITES holds whatever was written, so the walk owes the live read
const written = { w: Array };
written.w = Map;
for (const { from } of [written.w]) out.push(typeof from);
export { out };
