// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
for (var { from, ...staticRest } of [Array]) seen.push(typeof from, 'from' in staticRest);

for (var { at, ...instanceRest } of [[1, 2]]) seen.push(typeof at, 'at' in instanceRest);
export { seen };
