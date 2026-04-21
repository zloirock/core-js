import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2;
const _ref = getArr();
const at = (_ref2 = _at(_ref)) === void 0 ? alt : _ref2;
// Instance method with default + call init + one more instance method: triggers both
// needsMemo path (_ref = getArr()) AND inline default testRef. Verifies correct
// interaction: `const _ref = getArr(); let _ref2, at = (_ref2 = _at(_ref)) === void 0 ? alt : _ref2;
// const includes = _includes(_ref);`
const includes = _includes(_ref);