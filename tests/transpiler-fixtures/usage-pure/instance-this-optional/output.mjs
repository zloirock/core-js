import _includes from "@core-js/pure/actual/instance/includes";
function f() {
  return this == null ? void 0 : _includes(this).call(this, 'x');
}