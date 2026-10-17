import _atMaybeString from "@core-js/pure/actual/string/instance/at";
let x: string | number[] = "hello";
if (typeof x === "string") {
  const fn = () => _atMaybeString(x).call(x, -1);
}