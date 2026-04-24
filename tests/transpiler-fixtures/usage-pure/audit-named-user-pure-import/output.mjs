import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// user imports a NAMED specifier from a core-js pure module. `scanExistingCoreJSImports`
// registers only default-binding specifiers, so this named import is NOT registered as
// a user-managed pure import. plugin injects its own default import, producing a
// duplicate-source `import` (one default, one named) from the same module path
import { at } from '@core-js/pure/actual/array/instance/at';
var _ref;
console.log(at([1, 2, 3], 0));
_atMaybeArray(_ref = [4, 5, 6]).call(_ref, 1);