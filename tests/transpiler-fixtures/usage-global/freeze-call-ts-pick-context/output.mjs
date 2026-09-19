function foo(x: Pick<{
  a: number;
  b: string;
}, 'a'>) {
  Object.freeze(x);
}