import _at from "@core-js/pure/actual/string/at";
function foo(name: string) {
  const alias: typeof name = name;
  _at(alias).call(alias, -1);
}