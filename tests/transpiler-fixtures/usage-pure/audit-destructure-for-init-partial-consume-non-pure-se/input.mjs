// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
declare const log: () => void;
const userGlobal = { Array };
for (const { Array: { from }, ...rest } = (log(), userGlobal); false; ) {
  console.log(from, rest);
}
