function foo<T>(name: T extends string ? never : string) {
  name.at(-1);
}
