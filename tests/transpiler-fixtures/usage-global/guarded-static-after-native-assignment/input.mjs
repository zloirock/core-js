// A detached static guard follows a native slot in a discarded assignment.
// Getter reads and the earlier instance write retain their source positions.
// Global mode keeps the source pattern and supplies its imports.
const events = [];
let M = Map;
if (flag) M = {
  get name() { events.push('name'); return 'user'; },
  get groupBy() { events.push('groupBy'); return 7; },
  get at() { events.push('at'); return 8; },
};
let nm, method, other;
({ name: nm, at: other, groupBy: method } = M);
use(nm, method, other, events);
