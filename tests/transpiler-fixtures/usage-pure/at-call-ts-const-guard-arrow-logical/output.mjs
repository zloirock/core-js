import _atMaybeString from "@core-js/pure/actual/string/instance/at";
declare const x: string | number[];
typeof x === "string" && (() => _atMaybeString(x).call(x, -1))();