import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// A nested default that CARRIES the receiver: the outer slot is unknown, so what runs when it is undefined IS the default - and a
// mirror of that default fires under exactly the same condition, which makes it correct on every host, not only in a parameter
// list.
const src = {};
let entries;
({
  b: {
    entries
  } = Object
} = src);