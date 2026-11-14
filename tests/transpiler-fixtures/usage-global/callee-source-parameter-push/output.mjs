import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// Static reads inside instance-call arguments retain their constructor and effects.
const effects = [];
let r;
const out = [];
out.push((C => C.from((effects.push("arg"), [3])))(Array));
r = out;
export { r, effects };