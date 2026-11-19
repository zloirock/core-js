import "<CWD>/packages/core-js/modules/es.array.at.js";
import "<CWD>/packages/core-js/modules/es.array.of.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// a READ target with a claiming read: the write collapses AND the read still resolves the
// static through the stored conditional, typed dispatch included
let k9;
k9 = globalThis.window?.self.window;
export const viaStoredReadClaim = k9?.Array.of(3).at(0);