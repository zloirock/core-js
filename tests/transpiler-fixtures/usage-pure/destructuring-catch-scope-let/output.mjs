import _includes from "@core-js/pure/actual/instance/includes";
function f() {
  const includes = "top";
  try {} catch (_ref) {
    let includes = _includes(_ref);
    includes("x");
  }
  return includes;
}