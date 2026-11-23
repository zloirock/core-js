var _Array$from = require("@core-js/pure/actual/array/from");
var _globalThis = require("@core-js/pure/actual/global-this");
var _Object$defineProperty = require("@core-js/pure/actual/object/define-property");
var _Object$getOwnPropertyDescriptor = require("@core-js/pure/actual/object/get-own-property-descriptor");
var _Reflect$ownKeys = require("@core-js/pure/actual/reflect/own-keys");
// A getter on window can observe this classic script's binding while rest is copied.
const _ref = _globalThis.window,
  {
    [(watch(), 'Array')]: {}
  } = _ref,
  from = _Array$from,
  rest = (_ref2 => {
    const _ref7 = {};
    const _ref4 = _Reflect$ownKeys(typeof _ref2 === "object" || typeof _ref2 === "function" ? _ref2 : {
      ..._ref2
    });
    for (let _ref3 = 0; _ref3 < _ref4.length; _ref3 += 1) {
      const _ref5 = _ref4[_ref3];
      const _ref6 = _ref5 !== "Array" && _Object$getOwnPropertyDescriptor(_ref2, _ref5);
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
record(from([7]), rest.after);