// let declared inside a for-loop body BlockStatement. each iteration creates a
// fresh binding, but the straight-line check is per-iteration and must still
// reach the compound assignment through the block's `.body` array. includes is
// array+string ambiguous so the narrow is driven by flow, not the method.
for (let i = 0; i < 1; i++) {
  let x: string | string[] = [];
  x = "hi";
  x.includes("h");
}
