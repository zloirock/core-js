import _includes from "@core-js/pure/actual/instance/includes";
try {
  throw obj;
} catch (_ref) {
  let includes = _includes(_ref);
  const result = includes("x");
}