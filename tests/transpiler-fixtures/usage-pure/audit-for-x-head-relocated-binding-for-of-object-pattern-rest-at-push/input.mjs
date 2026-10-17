// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const rows = Object.assign([1, [2]], { extra: 7 });
const seen = [];
for (const { at, ...rest } of [rows]) {
  seen.push(typeof at, 'at' in rest, rest.at(0));
}
export { seen };
