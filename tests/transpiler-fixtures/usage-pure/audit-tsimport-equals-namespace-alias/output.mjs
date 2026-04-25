// `import Promise = M.AsyncOp` aliases a user namespace member at runtime. `Promise` here
// shadows the global - plugin must not polyfill `Promise.resolve` against the polyfilled
// constructor (would call `_Promise$resolve` instead of the user's M.AsyncOp.resolve)
import M = require("mod");
import Promise = M.AsyncOp;
const p = Promise.resolve(1);
export { p };