function foo<T>(items: T extends string ? number[] : never) {
  items.at(-1);
}
