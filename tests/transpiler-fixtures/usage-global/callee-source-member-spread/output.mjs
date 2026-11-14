import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const out = [];
const o = {
  make() {
    effects.push("callee");
    return Array;
  }
};
out.push(...o.make().from([3]));
r = out;
export { r, effects };