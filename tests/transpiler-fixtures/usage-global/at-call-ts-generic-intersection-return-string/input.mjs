function tag<T>(x: T): T & { __tag: true } {
  return x as any;
}
tag('hello').at(0);
