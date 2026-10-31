import _includes from "@core-js/pure/actual/instance/includes";
import _Object$is from "@core-js/pure/actual/object/is";
var _ref;
// a call to a static that runs no code of its arguments cannot invoke the body stored on the holder,
// so the field keeps both of its written types
function change() {
  this.data = foreign;
}
const box = {
  data: [10, 20]
};
box.data = '1020';
box.change = change;
_Object$is(box, other);
export const result = _includes(_ref = box.data).call(_ref, '02');