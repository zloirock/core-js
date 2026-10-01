import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare const x: string | number[];
const obj = {
  get val() {
    if (typeof x === "string") return _atMaybeString(x).call(x, -1);
  }
};