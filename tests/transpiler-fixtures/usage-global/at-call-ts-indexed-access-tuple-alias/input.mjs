type Pair = [string, number[]];
function foo(x: Pair[1]) {
  x.at(-1);
}
