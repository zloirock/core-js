// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let log = [];
const { of, ...rest } = (() => { log.push(1); return Array; })();
of(2);
export { rest, log };
