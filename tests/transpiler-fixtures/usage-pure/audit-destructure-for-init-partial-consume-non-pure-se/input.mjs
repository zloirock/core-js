// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
declare const log: () => void;
const userGlobal = { Array };
for (const { Array: { from }, ...rest } = (log(), userGlobal); false; ) {
  console.log(from, rest);
}
