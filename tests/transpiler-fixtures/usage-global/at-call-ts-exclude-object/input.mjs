function foo(x: Exclude<string | number[] | string[], object>) {
  x.at(0);
}
