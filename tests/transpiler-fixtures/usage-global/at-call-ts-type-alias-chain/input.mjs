type A = number[];
type B = A;
function foo(x: B) {
  x.at(-1);
}
