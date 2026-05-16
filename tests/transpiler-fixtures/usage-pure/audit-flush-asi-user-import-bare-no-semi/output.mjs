import _at from "@core-js/pure/actual/instance/at";
// Bare side-effect-only user import without trailing `;`. when injector flushes its
// `var _ref;` after the user import, the emission must terminate the prior import line
// (leading `\n` or implicit terminator). without this, the bundler sees
// `import "y"var _ref;` and bails with SyntaxError on the next parse pass.
import "y";
var _ref;
_at(_ref = foo())?.call(_ref, -1);