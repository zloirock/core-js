import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
var _ref;
// A nullable realm keeps its guard while its present branch serves the constructor.
// A stored receiver preserves the same identity and throwing path.
const {
  prototype: map
} = (_ref = null == _globalThis.window ? void 0 : _self, _ref === _globalThis ? _Map : _ref.Map);
let saved;
const {
  prototype: set
} = (saved = null == _globalThis.window ? void 0 : _self, saved === _globalThis ? _Set : saved.Set);
use(map, set, saved);