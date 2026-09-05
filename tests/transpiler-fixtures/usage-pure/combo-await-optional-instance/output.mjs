import _at from "@core-js/pure/actual/instance/at";
async function f(p) {
  var _ref;
  await (null == (_ref = await p) ? void 0 : _at(_ref)?.call(_ref, -1));
}