import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// An unread body can receive the holder through a different binding.
function change() {
  this.data = '1020';
}
const box = {
  data: [10, 20]
};
const alias = box;
alias.change = change;
box.change();
export const result = box.data.includes('02');