import _includes from "@core-js/pure/actual/instance/includes";
async function f() {
  try {} catch (_ref) {
    let includes = _includes(_ref);
    await includes("x");
  }
}