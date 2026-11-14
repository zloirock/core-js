import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
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
out.push(o.make().from((effects.push("arg"), [3])));
r = out;
export { r, effects };