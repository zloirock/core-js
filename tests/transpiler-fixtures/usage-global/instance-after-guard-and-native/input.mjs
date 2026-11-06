// An instance read after a guarded static retains the intervening native read.
// Capturing after the detached guard keeps every binding exactly once.
let M = Map;
if (flag) M = { name: 'user', at: 8, groupBy: 7 };
const { groupBy: method, at: other, name: nm } = M;
use(method, other, nm);
