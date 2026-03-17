import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function foo<T: string>(x: T) {
  _atInstanceProperty(x).call(x, -1);
}