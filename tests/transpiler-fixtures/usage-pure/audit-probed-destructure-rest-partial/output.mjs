import _globalThis from "@core-js/pure/actual/global-this";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
import _self from "@core-js/pure/actual/self";
// Read the guarded constructor before initializing its exported method. The rest
// copy excludes that constructor. A missing receiver still throws at the pattern.
const _ref = null == _globalThis.window ? void 0 : _self,
  {
    Math: {}
  } = _ref,
  viaRestDeclinedAnchor = _Math$trunc,
  viaRestRest = (_ref2 => {
    const _ref7 = {};
    const _ref4 = _Reflect$ownKeys(typeof _ref2 === "object" || typeof _ref2 === "function" ? _ref2 : {
      ..._ref2
    });
    for (let _ref3 = 0; _ref3 < _ref4.length; _ref3 += 1) {
      const _ref5 = _ref4[_ref3];
      const _ref6 = _ref5 !== "Math" && _Object$getOwnPropertyDescriptor(_ref2, _ref5);
      if (_ref6 && _ref6.enumerable) _Object$defineProperty(_ref7, _ref5, {
        __proto__: null,
        value: _ref2[_ref5],
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    return _ref7;
  })(_ref);
export { viaRestDeclinedAnchor, viaRestRest };
export const viaPartialProbed = _Number$isInteger;
export const {
  customZ: viaPartialCustom
} = null == _globalThis.window ? void 0 : _self.Number;