// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const rows = Object.assign([1, [2]], { extra: 7 });
const seen = [];
// a nested leaf beside a SIBLING relocates too: what it buys is the declaration host, and the
// sibling rides along in the residual reading the same memo
for (const { y: { at: viaSibling, keep } } of [{ y: rows, keep: 5 }]) {
  seen.push(typeof viaSibling, keep);
}
export { seen };
