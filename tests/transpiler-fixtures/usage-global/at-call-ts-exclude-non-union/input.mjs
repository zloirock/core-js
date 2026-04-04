function foo(x: Exclude<number[], string>) {
  x.at(-1);
}
