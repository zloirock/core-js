import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// Literal-wrapper destructuring stays native; global still supplies the static.
const effects = [];
let r;
const out = [];
out.push((({
  C
}) => C.from([3]))({
  C: Array
}));
r = out;
export { r, effects };