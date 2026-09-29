import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A transparent write-target wrapper cannot hide an escaping replacement body.
// Dynamic writes intentionally exceed the initializer types; the wrappers erase at runtime.
function change(value) {
  value.data = '1020';
}
const box = {
  data: [10, 20],
  change() {}
};
box.change! = function () {
  change(this);
};
box.change();
export const result = _includes(_ref = box.data).call(_ref, '02');