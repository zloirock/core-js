// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const g = globalThis;
function withDefault({ from, ...rest } = g.self.Array) {
  return from([1]);
}
withDefault();
