function wrap<T>(x: T): [first: T, ...rest: T[]] {
  return [x, x] as any;
}
for (const s of wrap('hello')) {
  s.at(0);
}
