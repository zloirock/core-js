import "core-js/modules/es.array.at";
class Config {
  static items: string[] = [];
}
const Cfg = Config;
function foo(x: typeof Cfg.items) {
  x.at(-1);
}