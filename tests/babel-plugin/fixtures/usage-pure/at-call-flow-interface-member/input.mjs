interface Config {
  name: string;
}
function foo(cfg: Config) {
  cfg.name.at(-1);
}
