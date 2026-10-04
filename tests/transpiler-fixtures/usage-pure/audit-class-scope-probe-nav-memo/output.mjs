import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref5, _ref7, _ref8;
// Instance field receiver memos belong to each initializer evaluation. Definition-time
// computed keys and static fields use the enclosing scope; static blocks and methods
// own their vars. Nested instance fields receive their own initializer activations too.
_globalThis.classBox = {
  list: ['ab', 'cd'],
  n: 7,
  key: 'm'
};
export class Slots {
  inst = (() => {
    var _ref;
    return null == (_ref = null == _globalThis.window ? void 0 : _self.classBox.list) ? void 0 : _at(_ref).call(_ref, 0);
  })();
  static stat = null == _globalThis.window ? void 0 : _self.classBox.n;
  #priv = (() => {
    var _ref2;
    return null == (_ref2 = (null == _globalThis.window ? void 0 : _self.classBox).list) ? void 0 : _at(_ref2).call(_ref2, 0);
  })();
  static {
    var _ref3;
    _globalThis.classStatic = null == (_ref3 = null == _globalThis.window ? void 0 : _self.classBox.list) ? void 0 : _at(_ref3).call(_ref3, 0);
  }
  method() {
    var _ref4;
    return null == (_ref4 = null == _globalThis.window ? void 0 : _self.classBox.list) ? void 0 : _at(_ref4).call(_ref4, 0);
  }
  readPriv() {
    return this.#priv;
  }
}
export class Keys {
  [null == (_ref5 = null == _globalThis.window ? void 0 : _self.classBox.list) ? void 0 : _at(_ref5).call(_ref5, 0)] = 1;
  static [(null == _globalThis.window ? void 0 : _self.classBox.key) ?? 'q']() {
    return 2;
  }
}

// a heritage clause takes a whole expression, and a class nested inside a method reaches for THAT
// method's scope rather than the module's
export class Heritage extends ((null == _globalThis.window ? void 0 : _self.classBox.list) ? Array : Object) {}
export const nested = class {
  run() {
    return class {
      inner = (() => {
        var _ref6;
        return null == (_ref6 = null == _globalThis.window ? void 0 : _self.classBox.list) ? void 0 : _at(_ref6).call(_ref6, 0);
      })();
    };
  }
};

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref7 = _atMaybeArray(_ref8 = ['ab', 'cd']).call(_ref8, (null == _globalThis.window ? void 0 : _self.classBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref7).call(_ref7, 'a');