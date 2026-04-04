async function foo(p: Promise<string>) {
  (await p).at(-1);
}
