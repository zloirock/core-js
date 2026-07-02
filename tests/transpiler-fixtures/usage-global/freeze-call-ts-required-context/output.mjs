function foo(x: Required<{
  a?: number;
}>) {
  Object.freeze(x);
}