import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function foo(name: string) {
  const alias: typeof name = name;
  _atInstanceProperty(alias).call(alias, -1);
}