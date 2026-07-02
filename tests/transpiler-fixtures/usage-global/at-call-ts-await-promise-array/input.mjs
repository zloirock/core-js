async function foo(p: Promise<number[]>) {
  (await p).at(-1);
}
