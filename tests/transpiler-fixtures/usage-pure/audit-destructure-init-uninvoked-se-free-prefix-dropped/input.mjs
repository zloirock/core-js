// a SIDE-EFFECT-FREE sequence prefix (an UNINVOKED function expression) holds a polyfilled call,
// and the destructure binding resolves entirely from the static receiver tail (`Array`), so the
// init value is unused. the dead prefix must be dropped WITHOUT injecting its inner polyfill (no
// dead `_at` import) and without orphaning a queued transform inside the dropped init span.
const { from } = (function () { return [1].at(0); }, Array);
from(1);
export { from };
