// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
// NEGATIVE: ... and that same write does reach the read once an OUTER loop RE-ENTERS the head,
// which evaluates the iterable again, against the slot the previous entry replaced
const reentered = { w: Array };
for (let round = 0; round < 2; round += 1) {
  for (const { from } of [reentered.w]) {
    reentered.w = Map;
    out.push(typeof from);
  }
}
export { out };
