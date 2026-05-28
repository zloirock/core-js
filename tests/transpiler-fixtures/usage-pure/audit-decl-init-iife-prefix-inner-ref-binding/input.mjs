// VariableDeclaration host with IIFE-bodied SE prefix containing an inner instance-method
// polyfill. inner `[1].at(0)` registers `var _ref;` inside the IIFE body DURING sibling
// traversal; the outer-polyfill emit must absorb that inner ref-decl into its replacement
// text BEFORE queuing the overwrite, otherwise the insert lands inside the overwrite range
const { from } = ((function () { return [1].at(0); })(), Array);
from([2, 3]);
