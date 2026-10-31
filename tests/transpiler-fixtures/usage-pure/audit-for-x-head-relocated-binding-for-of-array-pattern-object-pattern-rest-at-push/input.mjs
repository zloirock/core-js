// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const rows = Object.assign([1, [2]], { extra: 7 });
const nested = [{ y: rows }];
const seen = [];
// the same head one level in, where the claim travels with a renamed array element
for (const [{ y: { at, ...rest } }] of [nested]) {
  seen.push(typeof at, 'at' in rest, rest.at(0));
}
export { seen };
