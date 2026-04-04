function foo(name: string) {
  const alias: typeof name = name;
  alias.at(-1);
}
