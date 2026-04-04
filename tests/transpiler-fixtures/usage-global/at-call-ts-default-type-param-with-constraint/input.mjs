function foo<T extends any[] = string[]>(x: T) {
  x.at(0);
}
