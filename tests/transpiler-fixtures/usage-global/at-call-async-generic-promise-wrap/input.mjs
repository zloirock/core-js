async function wrap<T>(x: T): T {
  return x;
}
wrap('hello').finally(() => {});
