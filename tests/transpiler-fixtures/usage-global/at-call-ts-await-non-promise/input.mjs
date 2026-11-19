async function foo(x: number[]) {
  (await x).at(-1);
}
