function foo<T>(items: T extends string ? number[] | null : number[] | null) {
  items.at(-1);
}
