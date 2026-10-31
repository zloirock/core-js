// AssignmentExpression cascade host with an IIFE-bodied side-effect prefix containing an inner
// instance-method polyfill. `[1].at(0)` needs a `var _ref;` inside the IIFE body, registered
// while the cascade rewrite is still pending. if the cascade overwrite lands before that ref
// binding is baked into the lifted slice, `_ref` ends up undeclared and overlapping edits throw
let from;
({ Array: { from } } = ((function () { return [1].at(0); })(), globalThis));
from([2, 3]);
