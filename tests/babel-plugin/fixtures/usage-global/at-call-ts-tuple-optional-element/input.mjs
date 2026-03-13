function foo(x: [string, number?]) {
  const [a, b] = x;
  a.at(0);
  b.at(0);
}
