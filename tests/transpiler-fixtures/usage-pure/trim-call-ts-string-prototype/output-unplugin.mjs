import _trimMaybeString from "@core-js/pure/actual/string/instance/trim";
function f(x: string) { _trimMaybeString(x).call(x); }