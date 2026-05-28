// AssignmentExpression cascade host with an IIFE-bodied SE prefix containing an inner
// instance-method polyfill. `[1].at(0)` needs a `var _ref;` declaration inside the IIFE
// body, registered during traversal while the cascade rewrite is still pending. If the
// cascade overwrite lands before the ref binding is baked into the lifted SE slice, the
// resulting `_ref` reference ends up undeclared and the bundler throws on overlapping
// edits within the cascade statement range.
let from;
({ Array: { from } } = ((function () { return [1].at(0); })(), globalThis));
from([2, 3]);
