import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
const list = [];
function use() {/* empty */}
for (const {
  d: {
    isFinite
  } = Number
} of list) use(isFinite);