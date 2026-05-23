// two AssignmentExpression cascades back-to-back, each with its own IIFE-bodied SE prefix
// containing an inner instance-method polyfill. `pendingCascade` queue must accumulate
// both entries and `flushPendingCascade` must drain each statement's ref-bindings in its
// own range. uses `.at` in first cascade's IIFE and `.includes` in second to keep the
// two `_ref` declarations distinct; receiver inner polyfills differ so each statement's
// drain returns its own splice set
let from;
let of;
({ Array: { from } } = ((function () { return [1].at(0); })(), globalThis));
({ Array: { of } } = ((function () { return [2].includes(1); })(), globalThis));
from([3]);
of(4);
