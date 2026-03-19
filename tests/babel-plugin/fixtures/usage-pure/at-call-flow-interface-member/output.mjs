import _at from "@core-js/pure/actual/string/at";
interface Config {
  name: string
}
function foo(cfg: Config) {
  var _ref;
  _at(_ref = cfg.name).call(_ref, -1);
}