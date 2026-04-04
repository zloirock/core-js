interface Config {
  key: string;
}
type MyConfig = Config;
function foo(x: MyConfig) {
  Object.freeze(x);
}