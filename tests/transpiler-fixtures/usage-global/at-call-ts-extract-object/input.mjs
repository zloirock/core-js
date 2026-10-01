function foo(x: Extract<string | number[] | string[], object>) {
  x.at(0);
}
