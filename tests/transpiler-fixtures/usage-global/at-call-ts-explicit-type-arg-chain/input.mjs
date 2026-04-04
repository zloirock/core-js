function create<T>(): T[] {
  return [];
}
create<string>().find(Boolean).includes('x');
