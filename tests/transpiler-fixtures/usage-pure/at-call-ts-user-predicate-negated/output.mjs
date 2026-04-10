import _atMaybeString from "@core-js/pure/actual/string/instance/at";
function isStr(x: any): x is string {
  return typeof x === "string";
}
declare const x: string | number[];
if (!isStr(x)) throw new Error();
_atMaybeString(x).call(x, -1);