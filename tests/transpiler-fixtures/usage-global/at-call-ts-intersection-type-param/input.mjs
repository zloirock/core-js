function foo(x: number[] & { extra: boolean }) {
  x.at(-1);
}
