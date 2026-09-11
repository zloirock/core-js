import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `import require = X` (TSImportEqualsDeclaration) - TypeScript-specific syntax that
// creates a runtime binding to a module / namespace called `require`. plugin's
// require-shadow detection must recognise this form so subsequent `require('core-js/...')`
// calls aren't treated as polyfill entry points (the binding is user's, not the host)
import require = NS.helper;
require('core-js/actual/array/at');
_atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0);