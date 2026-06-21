import _at from "@core-js/pure/actual/instance/at";
// User import without trailing `;` (ASI). flushing the injected `var _ref;` after the
// import must terminate the prior import (leading newline) - otherwise the result
// `import x from "y"var _ref;` crashes the bundler with a SyntaxError on the next parse.
// both plugins must land `var _ref;` on its own line.
import x from "y"
var _ref;
_at(_ref = foo()).call(_ref, -1)