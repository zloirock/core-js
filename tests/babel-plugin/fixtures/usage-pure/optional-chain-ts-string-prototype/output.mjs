import _trim from "@core-js/pure/actual/instance/trim";
function f(s: string | null) {
  s == null ? void 0 : _trim(s).call(s);
}