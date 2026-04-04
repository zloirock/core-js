function foo(x: Exclude<string | RegExp, object>) {
  x.at(0);
}
