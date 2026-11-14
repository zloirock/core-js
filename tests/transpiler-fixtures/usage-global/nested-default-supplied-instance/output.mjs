import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// An open slot selects its own instance method or the receiver default's static.
const source = Function('return { list: [3] }')();
const {
  list: {
    entries
  } = Object
} = source;
use(entries.call(source.list).next().value);