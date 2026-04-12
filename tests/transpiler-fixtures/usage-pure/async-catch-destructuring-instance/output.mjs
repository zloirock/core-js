import _includes from "@core-js/pure/actual/instance/includes";
async function f() {
  try {
    await g();
  } catch (_ref) {
    let includes = _includes(_ref);
    includes("x");
  }
}