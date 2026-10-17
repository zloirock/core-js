import _at from "@core-js/pure/actual/instance/at";
// NEGATIVE: no polyfilled call in the argument, so nothing competes for the slot
export function plainTail(o) {
  var _ref;
  return null == (_ref = o.items) ? void 0 : _at(_ref).call(_ref, o.items.length - 1);
}