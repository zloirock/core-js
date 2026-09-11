// The mirror: asking for `import` output must not turn a CommonJS body into a module. It is a
// script, so the block-scoped `function Map` DOES hoist and shadow the global, and substituting a
// ponyfill over it would replace the user's own value.
const y = require("./y.js");
{ function Map() {} }
module.exports = { y, m: new Map() };
