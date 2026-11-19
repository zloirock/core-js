require("core-js/modules/es.string.at");
// A constructor-valued initializer evaluates its prefix once before prototype extraction.
// Parentheses must not duplicate the constructor key in the remaining navigation.
exports.String = String;
const {
  prototype: {
    at
  }
} = (before(), this.String);
exports.result = at;