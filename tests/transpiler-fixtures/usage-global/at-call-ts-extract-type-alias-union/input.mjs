type MyUnion = string | number;
function foo(x: Extract<MyUnion, string>) {
  x.at(-1);
}
