import "core-js/modules/es.object.freeze";
interface Config {
  key: string;
}
type MyConfig = Config;
function foo(x: MyConfig) {
  Object.freeze(x);
}