import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// A written slot no longer proves its receiver default will run.
let r;
const src = {};
src.list = [1, 2];
const {
  list: {
    entries
  } = Object
} = src;
r = entries.call(src.list).next().value;
use(r);