import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// @flow
// Type queries of ambient static fields preserve their declared value type.
declare class C {
  static items: string
}
function f(x: typeof C.items) {
  _atMaybeString(x).call(x, 0);
}