import "core-js/modules/es.object.freeze";
interface Config {
  key: string;
  value: number;
}
function foo(x: Config) {
  Object.freeze(x);
}