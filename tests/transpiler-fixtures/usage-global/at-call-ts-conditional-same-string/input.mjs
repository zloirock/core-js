function foo<T>(name: T extends number ? string : string) {
  name.at(-1);
}
