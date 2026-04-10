import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare const x: string | number[];
if (typeof x === "string") {
  const gen = function* () {
    yield _atMaybeString(x).call(x, -1);
  };
}