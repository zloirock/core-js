import "core-js/modules/es.object.is";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
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
Object.is(box, other);
export const result = box.data.includes('02');