import "core-js/modules/es.object.entries";
// A pristine missing slot still proves its receiver default will run.
let r;
const src = {};
const {
  list: {
    entries
  } = Object
} = src;
r = entries({
  a: 1
});
use(r);