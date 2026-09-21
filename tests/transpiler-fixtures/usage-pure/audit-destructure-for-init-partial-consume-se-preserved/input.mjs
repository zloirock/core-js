// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
declare const logCall: () => any;
for (const { Array: { from }, ...rest } = (logCall(), globalThis); false; ) {
  console.log(from, rest);
}
