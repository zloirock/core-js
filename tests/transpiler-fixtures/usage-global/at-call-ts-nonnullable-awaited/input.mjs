function foo(items: NonNullable<Awaited<Promise<string[]>> | null>) {
  items.at(-1);
}
