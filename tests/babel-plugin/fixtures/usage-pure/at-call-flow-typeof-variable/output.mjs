import _atMaybeString from "@core-js/pure/actual/string/instance/at";
function foo(name: string) {
  const alias: typeof name = name;
  _atMaybeString(alias).call(alias, -1);
}