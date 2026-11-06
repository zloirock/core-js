function foo(x: null) {
  // @ts-expect-error a read off a null or undefined type is the probe
  x.at(-1);
}