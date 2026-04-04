import _trimMaybeString from "@core-js/pure/actual/string/instance/trim";
function f(s: string | null) { _trimMaybeString(s) == null ? void 0 : _trimMaybeString(s).call(s); }