function foo(x: Exclude<{ key: string } | string, string>) {
  Object.freeze(x);
}
