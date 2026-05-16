import _at from "@core-js/pure/actual/instance/at";
// User import without trailing `;` (ASI). when the injector flushes its `var _ref;`
// after the user import, the emission must include a leading newline (or otherwise
// terminate the prior import) - otherwise the result `import x from "y"var _ref;`
// crashes the bundler with a SyntaxError on the next parse pass. mirrors babel-plugin's
// `reorderRefsAfterImports` which lands `var _ref;` on its own line via AST insertion.
import x from "y"
var _ref;

_at(_ref = foo()).call(_ref, -1)