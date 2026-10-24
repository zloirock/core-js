// the TS require-import twin binds the global like the bare proxy spelling: statics substitute
// (polyfill-always-wins) and a PATCH through the binding routes onto the injected constructor
import gtp = require("@core-js/pure/actual/global-this");
export const viaTsImportEquals = gtp.Iterator.from([2]);
gtp.Map.groupBy = function patched() { return 'p'; };
export const patchStillWins = gtp.Map.groupBy([], x => x);
