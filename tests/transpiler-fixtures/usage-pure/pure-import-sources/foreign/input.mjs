import array from './features/array';
import getList from './actual/list/get-list';
array.from([7]);
getList().at(-1);
function read(items = getList()) { return items.at(-1); }
use(read);
