import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// @flow
// A constructor alias keeps the declared static field type through typeof.
declare class C {
  static items: string
}
const D = C;
function read(x: typeof D.items) {
  return _atMaybeString(x).call(x, 0);
}