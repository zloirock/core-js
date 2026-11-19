var _atMaybeString = require("@core-js/pure/actual/string/instance/at");
// A constructor-valued initializer evaluates its prefix once before prototype extraction.
// Parentheses must not duplicate the constructor key in the remaining navigation.
exports.String = String;
const at = _atMaybeString((before(), this.String.prototype));
exports.result = at;