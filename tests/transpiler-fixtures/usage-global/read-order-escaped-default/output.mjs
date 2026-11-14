import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// An escaped slot may supply an instance instead of taking the static default.
let r;
const src = {};
const fill = Function("o", "o.list = [1, 2]");
fill(src);
const {
  list: {
    entries
  } = Object
} = src;
r = entries.call(src.list).next().value;
use(r);