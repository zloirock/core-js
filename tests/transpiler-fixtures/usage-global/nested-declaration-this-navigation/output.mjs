require("core-js/modules/es.array.includes");
// A constructor-valued initializer keeps its this root separate from its navigation keys.
// Global mode only installs the method; pure mode must preserve the receiver path.
exports.Array = Array;
const {
  prototype: {
    includes
  }
} = this.Array;
exports.result = includes;