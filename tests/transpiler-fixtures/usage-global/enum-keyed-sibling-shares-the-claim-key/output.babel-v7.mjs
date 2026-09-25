import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// a sibling keyed by an ENUM member resolves its key the way the claim funnel does, so a static
// beside it takes the same memo route on both legs as its literal-keyed twin
enum E {
  name = 'name',
}
let n = 0;
function mk() {
  return Array;
}
const {
  from: a,
  [E.name]: nm
} = (n++, mk());
const {
  of: b,
  name: nm2
} = (n++, mk());
use(a, nm, b, nm2);