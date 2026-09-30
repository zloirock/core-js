// A guarded static beside an extracted instance leaf retains the same narrow guard.
// Pending instance writes stay before the static; the native trailing slot survives.
let M = Map;
if (flag) M = { groupBy: 7, name: 'user' };
const { name: nm, groupBy: method, at: other } = M;
use(nm, method, other);
