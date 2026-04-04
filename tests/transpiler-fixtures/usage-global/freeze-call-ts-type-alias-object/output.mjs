import "core-js/modules/es.object.freeze";
type Config = {
  key: string;
};
function foo(x: Config) {
  Object.freeze(x);
}