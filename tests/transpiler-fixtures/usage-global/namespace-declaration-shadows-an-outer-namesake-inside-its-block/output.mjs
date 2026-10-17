import "core-js/modules/es.array.find-last";
import "core-js/modules/es.string.at";
// a namespace declaring a name an outer binding declared before it shadows that binding inside its block:
// a read there takes the namespace's value, a read outside the outer one. distinct method per line
const a = [1, 2];
namespace Inner {
  const a = 'abc';
  use(a.at(-1));
}
use(a.findLast(Boolean));