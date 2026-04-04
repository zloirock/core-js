interface Config { name: string }
type MyConfig = Config;
function foo(cfg: MyConfig) {
  cfg.name.at(0);
}
