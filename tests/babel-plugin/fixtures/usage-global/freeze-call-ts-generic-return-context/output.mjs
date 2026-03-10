function identity<T>(x: T): T {
  return x;
}
Object.freeze(identity(new Date()));