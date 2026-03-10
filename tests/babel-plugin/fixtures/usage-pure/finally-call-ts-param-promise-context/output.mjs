function foo(x: Promise<number>) {
  x.finally(cb);
}