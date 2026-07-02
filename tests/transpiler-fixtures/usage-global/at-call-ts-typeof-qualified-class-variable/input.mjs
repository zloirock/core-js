class Config {
  static items: string[] = [];
}
const Cfg = Config;
function foo(x: typeof Cfg.items) {
  x.at(-1);
}
