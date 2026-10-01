// usage-global counterpart: IIFE-identity receiver resolution peels the `(a)` paren / SE tail
// off the returned node so the destructured static narrows to its constructor and the global
// polyfill is injected. distinct ie11-absent statics per line
const { from } = (a => (a))(Array);
const { of } = (a => (0, a))(Array);
from([1]);
of(2);
