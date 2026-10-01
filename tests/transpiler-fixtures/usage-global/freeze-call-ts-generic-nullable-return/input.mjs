function identity<T>(x: T): T | null {
  return x;
}
Object.freeze(identity(new Date()));
