// A retained instance capture keeps the constructor guard of its later static sibling.
// A supplied object keeps its own getters and values in source property order.
const log = [];
let M = Map;
if (supplied) M = {
  get name() { log.push('name'); return 'user'; },
  get groupBy() { log.push('groupBy'); return 7; },
  get at() { log.push('at'); return 8; },
};
let nm, method, other;
({ at: other, name: nm, groupBy: method } = M);
use(nm, method, other, log);
