// loop back-edge: `x` has no initialiser; a straight-line assignment gives it an array before the
// loop, but the loop tail reassigns it to a string, so the next-iteration `x.includes()` runs on a
// string. the source-position narrow is stale - degrade to the generic instance variant.
declare function cond(): boolean;
declare function readString(): string;
let x;
x = [1, 2, 3];
while (cond()) {
  x.includes(1);
  x = readString();
}
