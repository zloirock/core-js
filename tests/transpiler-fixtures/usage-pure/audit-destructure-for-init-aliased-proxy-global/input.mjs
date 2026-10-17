// A loop initializer resolves a realm alias and preserves its sequence prefix once.
// The alias declaration keeps its own global rewrite.
declare const logCall: () => any;
const obj = globalThis;
for (const { Array: { from } } = (logCall(), obj); false; ) {
  console.log(from);
}
