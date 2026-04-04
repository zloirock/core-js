function foo(x: Extract<string | number[], number[]>) {
  x.at(-1);
}
