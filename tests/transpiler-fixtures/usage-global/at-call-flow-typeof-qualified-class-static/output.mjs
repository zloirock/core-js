import "core-js/modules/es.array.at";
class Config {
  static items = ['a', 'b'];
}
function foo(x: typeof Config.items) {
  x.at(-1);
}