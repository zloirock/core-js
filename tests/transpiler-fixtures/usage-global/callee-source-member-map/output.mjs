import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.string.iterator";
// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const o = {
  make() {
    effects.push("callee");
    return Array;
  }
};
r = [3, 4].map(x => o.make().from([x]));
export { r, effects };