// the TS require-import twin binds the same global - one import surface serves both forms
import gte = require("@core-js/pure/actual/global-this");
export const viaTsImportEquals = gte.Iterator.from([1]);
