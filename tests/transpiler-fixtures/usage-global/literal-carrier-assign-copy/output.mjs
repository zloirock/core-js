import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// Copying a carrier with Object.assign preserves its reference to the held object.
const box = {
  data: [10, 20]
};
const {
  box: alias
} = Object.assign({}, {
  box
});
alias.data = "1020";
export const result = box.data.includes("02");