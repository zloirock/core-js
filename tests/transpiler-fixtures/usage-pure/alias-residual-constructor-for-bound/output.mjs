import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref;
// The residual reads the constructor after preserving the nullable holder.
const held = _globalThis.window;
for (const {
  prototype: proto = fallback()
} = (effect(), _ref = (held, held === _globalThis ? _self : held.self), _ref === _globalThis ? _Map : _ref.Map);;) {
  use(proto);
  break;
}