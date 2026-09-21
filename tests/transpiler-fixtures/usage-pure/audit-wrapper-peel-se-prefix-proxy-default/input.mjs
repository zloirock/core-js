// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
function f({ from, ...rest } = (effect(), globalThis.self.Array)) {
  return from([1]);
}
f();
