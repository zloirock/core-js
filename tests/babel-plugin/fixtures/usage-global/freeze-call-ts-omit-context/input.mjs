function foo(x: Omit<{ a: number }, 'a'>) {
  Object.freeze(x);
}
