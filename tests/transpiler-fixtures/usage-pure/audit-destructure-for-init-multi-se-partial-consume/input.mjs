// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
declare const a: () => void;
declare const b: () => void;
for (const { Array: { from }, ...rest } = (a(), b(), globalThis); false; ) {
  console.log(from, rest);
}
