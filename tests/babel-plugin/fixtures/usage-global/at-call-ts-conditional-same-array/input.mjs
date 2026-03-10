function foo<T>(items: T extends string ? number[] : number[]) {
  items.at(-1);
}
