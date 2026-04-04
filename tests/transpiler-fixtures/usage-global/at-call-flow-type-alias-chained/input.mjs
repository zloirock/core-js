type Inner = string;
type Outer = Inner;
function foo(x: Outer) {
  x.at(-1);
}
