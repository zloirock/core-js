function foo(name: Awaited<Promise<string>>) {
  name.at(-1);
}
