import "core-js/modules/es.array.at";
class Config {
  static items: number[] = [];
}
function foo(x: typeof Config.items) {
  x.at(-1);
}