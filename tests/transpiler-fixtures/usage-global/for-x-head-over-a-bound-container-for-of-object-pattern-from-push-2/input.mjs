// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
const WN = { a: { b: Array } };
for (const { from } of [WN.a.b]) out.push(typeof from);
export { out };
