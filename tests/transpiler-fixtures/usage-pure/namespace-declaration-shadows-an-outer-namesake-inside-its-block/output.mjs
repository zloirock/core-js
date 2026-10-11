import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a namespace declaring a name an outer binding declared before it shadows that binding inside its block:
// a read there takes the namespace's value, a read outside the outer one. distinct method per line
const a = [1, 2];
namespace Inner {
  const a = 'abc';
  use(_atMaybeString(a).call(a, -1));
}
use(_findLastMaybeArray(a).call(a, Boolean));