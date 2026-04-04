function foo(x: Extract<string | number[], string>) {
  x.at(-1);
}
