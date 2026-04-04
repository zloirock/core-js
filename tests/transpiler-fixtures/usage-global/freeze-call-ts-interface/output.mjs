interface Config {
  key: string;
  value: number;
}
function foo(x: Config) {
  Object.freeze(x);
}