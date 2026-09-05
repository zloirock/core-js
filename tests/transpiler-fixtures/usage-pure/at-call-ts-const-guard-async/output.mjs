import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare const x: string | number[];
if (typeof x === "string") {
  const fn = async function () {
    return _atMaybeString(x).call(x, -1);
  };
}