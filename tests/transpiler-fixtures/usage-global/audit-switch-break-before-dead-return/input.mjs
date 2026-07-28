// `break` in a switch case leaves the switch and control resumes after it, so a `return` that
// follows the break is unreachable and the branch is not a function-level exit. Only the branch
// that really exits lets the other arm's assignment dominate the later read.
declare const flag: boolean;

function divertedByBreak() {
  let value: number[] | string = [1, 2, 3];
  if (flag) { value = "abc"; } else { switch (0) { default: break; return; } }
  return value.at(0);
}

function exitsForReal() {
  let other: number[] | string = [1, 2, 3];
  if (flag) { other = "abc"; } else { switch (0) { default: return; } }
  return other.includes("a");
}
