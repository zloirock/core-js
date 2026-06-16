// A SIDE-EFFECT-FREE sequence prefix (an UNINVOKED function expression) holds a polyfilled call,
// and the destructure binding resolves entirely from the static receiver tail (`Array`), so the
// init value is unused. the dead prefix must be dropped WITHOUT injecting its inner polyfill (no
// dead `_at` import) and without orphaning a queued transform inside the dropped init span. an
// INVOKED prefix or a real side effect would be kept and its inner polyfill must survive - that is
// covered by other fixtures; this one locks the uninvoked-SE-free-prefix drop
const { from } = (function () { return [1].at(0); }, Array);
from(1);
export { from };
