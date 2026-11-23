import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// A for-init capture keeps the callback before of is initialized and excludes Array from rest.
// The served static leaf comes from array/of without moving the rest read.
export function collect(observe) {
  for (const [,] = [(observe(() => of), _globalThis)], {
      Array: {}
    } = _globalThis, of = _Array$of, rest = (_ref => {
      const _ref6 = {};
      const _ref3 = _Reflect$ownKeys(typeof _ref === "object" || typeof _ref === "function" ? _ref : {
        ..._ref
      });
      for (let _ref2 = 0; _ref2 < _ref3.length; _ref2 += 1) {
        const _ref4 = _ref3[_ref2];
        const _ref5 = _ref4 !== "Array" && _Object$getOwnPropertyDescriptor(_ref, _ref4);
        if (_ref5 && _ref5.enumerable) _Object$defineProperty(_ref6, _ref4, {
          __proto__: null,
          value: _ref[_ref4],
          enumerable: true,
          configurable: true,
          writable: true
        });
      }
      return _ref6;
    })(_globalThis);;) {
    return [of(3), rest];
  }
}