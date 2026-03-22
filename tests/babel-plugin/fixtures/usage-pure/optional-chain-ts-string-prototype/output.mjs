import _trimMaybeString from "@core-js/pure/actual/string/instance/trim";
function f(s: string | null) {
  s == null ? void 0 : _trimMaybeString(s).call(s);
}