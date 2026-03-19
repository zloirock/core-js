import _at from "@core-js/pure/actual/string/at";
function foo<T: string>(x: T) {
  _at(x).call(x, -1);
}