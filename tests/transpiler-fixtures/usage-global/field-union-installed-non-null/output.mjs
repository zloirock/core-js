import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
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
export const result = box.data.includes('02');