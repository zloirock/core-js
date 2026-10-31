import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref;
// A prefix before an optional realm receiver runs before the guarded constructor read.
// Absence still throws before the residual evaluates its own default.
const {
  missing = fallback()
} = (record(), _ref = null == _globalThis.window ? void 0 : _self, _ref === _globalThis ? _Map : _ref.Map);
use(missing);