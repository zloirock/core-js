async function foo(p: Promise<{ key: string }>) {
  Object.freeze(await p);
}
