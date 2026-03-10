function foo<T>(x: { [K in keyof T]: string }) {
  Object.freeze(x);
}