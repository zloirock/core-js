function foo<T = string[]>(x: T) {
  x.at(0);
}

foo();
