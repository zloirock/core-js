function foo(name: NonNullable<string | undefined>) {
  name.at(-1);
}
