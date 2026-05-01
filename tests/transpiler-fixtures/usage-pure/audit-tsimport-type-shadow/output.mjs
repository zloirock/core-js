import _Set from "@core-js/pure/actual/set/constructor";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$from from "@core-js/pure/actual/array/from";
// TSImportEqualsDeclaration with isExport=false. type-only import equals is tsc-elided;
// runtime references to `Set` resolve to the global. Without filtering this binding shape
// in `hasBinding`, the polyfill would suppress for tsc-elided imports. Both adapters use
// `isAmbientBindingShape` (shared helper) for symmetric filtering
import Set = require('node:set');
function build() {
  var _ref;
  const s = new _Set([1, 2]);
  return _atMaybeArray(_ref = _Array$from(s)).call(_ref, 0);
}
build();