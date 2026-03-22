import _atMaybeString from "@core-js/pure/actual/string/instance/at";
interface Config {
  name: string
}
function foo(cfg: Config) {
  var _ref;
  _atMaybeString(_ref = cfg.name).call(_ref, -1);
}