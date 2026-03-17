import _atInstanceProperty from "@core-js/pure/actual/instance/at";
interface Config {
  name: string
}
function foo(cfg: Config) {
  var _ref;
  _atInstanceProperty(_ref = cfg.name).call(_ref, -1);
}