import "core-js/modules/es.array.at";
// A stable named function is assigned through a local receiver alias.
function make() {
  return [8, 9];
}
const box = {};
const alias = box;
alias.fn = make;
use(box.fn().at(-1));