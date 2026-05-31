// loop back-edge through a do-while: `x` is declared outside the loop and reassigned to a string at
// the body tail, so iteration 2's `x.at()` runs on a string. the array narrow is stale - degrade to
// the generic instance variant.
declare function cond(): boolean;
declare function readString(): string;
let x = [1, 2, 3];
do {
  x.at(-1);
  x = readString();
} while (cond());
