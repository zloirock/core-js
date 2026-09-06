// A CommonJS wrapper passes `require` as a PARAMETER, and B.3.3.1 blocks the Annex-B hoist of a
// block function for a parameter name - so this one shadows nothing and the entry call is the
// host's own. The body's `module.exports` is what says this is that host.
{ function require() {} }
require("core-js/es/array/includes");
module.exports = 1;
