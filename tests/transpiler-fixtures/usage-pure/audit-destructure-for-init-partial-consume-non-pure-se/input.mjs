// A user-created literal container keeps its native static read and rest exclusion.
// The source prefix stays inside the loop initializer.
declare const log: () => void;
const userGlobal = { Array };
for (const { Array: { from }, ...rest } = (log(), userGlobal); false; ) {
  console.log(from, rest);
}
