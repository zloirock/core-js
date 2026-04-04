type Config = { key: string };
function foo(x: Config) {
  Object.freeze(x);
}
