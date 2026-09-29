import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A replacement for a declared method can expose its receiver to another writer.
// The field's writer set is open, so includes keeps every receiver family.
function change(value) {
  value.data = '1020';
}
const box = {
  data: [10, 20],
  change() {}
};
box.change = function () {
  change(this);
};
box.change();
_includes(_ref = box.data).call(_ref, '02');