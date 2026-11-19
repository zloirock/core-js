import _at from "@core-js/pure/actual/instance/at";
import array from './features/array';
import getList from './actual/list/get-list';
var _ref;
array.from([7]);
_at(_ref = getList()).call(_ref, -1);
function read(items = getList()) {
  return _at(items).call(items, -1);
}
use(read);