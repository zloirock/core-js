// A CommonJS wrapper passes `require` as a PARAMETER, so B.3.3.1 blocks the Annex-B hoist of this
// block function - the call below is the host's loader, so the alias really does hold the
// polyfill and the second read dedups onto it instead of minting a second import.
{ function require() {} }
const F = require("@core-js/pure/actual/array/from");
module.exports = [F, Array.from(y)];
