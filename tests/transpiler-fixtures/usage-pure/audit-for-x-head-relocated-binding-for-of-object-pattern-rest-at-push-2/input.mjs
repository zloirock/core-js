// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const rows = Object.assign([1, [2]], { extra: 7 });
const seen = [];
// a bodyless head: the extraction has to build the block it puts the residual in
for (const { at, ...rest } of [rows]) seen.push(typeof at, 'at' in rest);
export { seen };
