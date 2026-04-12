import _includes from "@core-js/pure/actual/instance/includes";
try {} catch (_ref) {
  let includes = _includes(_ref);
  let {
    message: msg
  } = _ref;
  includes("x");
  console.log(msg);
}