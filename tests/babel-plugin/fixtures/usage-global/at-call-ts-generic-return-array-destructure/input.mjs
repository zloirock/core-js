function wrap<T>(item: T): T[] {
  return [item];
}
const [first] = wrap('hello').filter(Boolean);
first.at(0);
