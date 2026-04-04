function foo(items: NonNullable<number[] | null>) {
  items.at(-1);
}
