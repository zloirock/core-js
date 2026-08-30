import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref4, _ref5, _ref6, _ref7;
// user names that LOOK like generated refs but are not bindings - object keys, a class field and
// its reads, a label with its break, a private name - sit where the final renumber could touch
// them: a bodyless body wrap copies the user statement into emitted text, and the swap-inducing
// chain below makes the renumber non-identity. none of them may move: a key is a property name
// the object keeps, a label must match its break, a private name must match its declaration
export const o = {
  _ref: 1,
  _ref2: 2,
  _ref3: 3,
  _ref4: 4
};
export function labeled(c) {
  if (c) _ref4: for (;;) {
    var _ref;
    _atMaybeArray(_ref = [1]).call(_ref, 0);
    break _ref4;
  }
}
export class C {
  #_ref4 = 1;
  m(c) {
    if (c) for (;;) {
      var _ref2;
      _atMaybeArray(_ref2 = [this.#_ref4]).call(_ref2, 0);
      break;
    }
  }
}
export function field(c) {
  if (c) for (;;) {
    class K {
      _ref4 = 1;
      m() {
        var _ref3;
        return _atMaybeArray(_ref3 = [this._ref4]).call(_ref3, 0);
      }
    }
    new K();
    break;
  }
}
let w;
export const r = null == (_ref4 = null == (w = _globalThis.window) ? void 0 : _flatMaybeArray(_ref5 = _Array$of(6))?.call(_ref5)) || null == (_ref6 = _mapMaybeArray(_ref4)) ? void 0 : _atMaybeArray(_ref7 = _ref6.call(_ref4, x => x))?.call(_ref7, 0);