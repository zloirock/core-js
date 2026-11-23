import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// an exported destructure with a rest sibling splits into an exported extraction and a kept rest
// level: the claimed static leaves the pattern as an exported binding of its own, while the rest keeps
// its source with the claimed key as an exclusion, so it copies the keys the source copies.
const {
    Array: {}
  } = _globalThis,
  from = _Array$from,
  rest = (_ref => {
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
  })(_globalThis);
export { from, rest };
[from, rest];