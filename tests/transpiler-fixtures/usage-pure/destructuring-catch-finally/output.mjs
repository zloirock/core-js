import _includes from "@core-js/pure/actual/instance/includes";
try {
  f();
} catch (_ref) {
  let includes = _includes(_ref);
  includes("x");
} finally {
  g();
}