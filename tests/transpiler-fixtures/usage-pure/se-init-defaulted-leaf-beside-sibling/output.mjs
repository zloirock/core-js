import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref6, _ref7;
// A DEFAULTED instance leaf under a deeper hop, beside a sibling leaf, off a realm init that runs
// effects first: the whole init memoizes and the leaf dispatches off the memo through the canonical
// default guard - the route its undefaulted twin takes, which once admitted the bare identifier
// alone and left the defaulted leaf native on the unplugin leg. The anonymous default keeps its name.
let eff = 0;
const o1 = _Array$of;
const f1 = (_ref = _flatMaybeArray((eff++, _globalThis.Array.prototype))) === void 0 ? {
  "f1": () => 1
}["f1"] : _ref;
eff++;
const f2 = (_ref2 = _flatMaybeArray(_globalThis.Array.prototype)) === void 0 ? {
  "f2": () => 1
}["f2"] : _ref2;
const a2 = _atMaybeArray(_globalThis.Array.prototype);
const o3 = _Array$of;
const f3 = (_ref3 = _flatMaybeArray((eff++, _self.Array.prototype))) === void 0 ? {
  "f3": () => 1
}["f3"] : _ref3;
const _ref5 = (eff++, _globalThis.Array);
const o4 = _Array$of;
const f4 = (_ref4 = _flatMaybeArray(_ref5.prototype)) === void 0 ? {
  "f4": () => 1
}["f4"] : _ref4;
const a4 = (_ref6 = _atMaybeArray(_ref5.prototype)) === void 0 ? {
  "a4": () => 2
}["a4"] : _ref6;
let f5, o5;
eff++;
// ... and off a USER receiver of unknown type, where the default is live and its name observable
o5 = _Array$of;
f5 = (_ref7 = _flatMaybeArray(_globalThis.Array.prototype)) === void 0 ? {
  "f5": () => 1
}["f5"] : _ref7;
function pick(user) {
  var _ref8;
  const _ref9 = (eff++, user);
  const m6 = (_ref8 = _findIndexMaybeArray(_ref9.codes)) === void 0 ? {
    "m6": () => 1
  }["m6"] : _ref8;
  const {
    other: o6
  } = _ref9;
  return [m6, o6];
}
export { eff, f1, o1, f2, a2, f3, o3, f4, a4, o4, f5, o5, pick };