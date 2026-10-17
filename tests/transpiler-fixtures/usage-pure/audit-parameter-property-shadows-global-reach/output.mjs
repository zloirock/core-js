import _Set from "@core-js/pure/actual/set/constructor";
class Outside {
  constructor(private Set: any) {}
  reach() {
    return new _Set([1]);
  }
}
new Outside(function () {}).reach();