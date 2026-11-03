var _includesMaybeArray = require("@core-js/pure/actual/array/instance/includes");
// A constructor-valued initializer keeps its this root separate from its navigation keys.
// Global mode only installs the method; pure mode must preserve the receiver path.
exports.Array = Array;
const includes = _includesMaybeArray(this.Array.prototype);
exports.result = includes;