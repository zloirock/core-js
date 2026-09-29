import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A cast on a static write target preserves the unread-body gate.
// Dynamic writes intentionally exceed the initializer types; the wrappers erase at runtime.
function change(value) {
  value.data = '1020';
}
class Box {
  static data = [10, 20];
  static change() {}
}
(Box.change as any) = function () {
  change(this);
};
Box.change();
export const result = _includes(_ref = Box.data).call(_ref, '02');