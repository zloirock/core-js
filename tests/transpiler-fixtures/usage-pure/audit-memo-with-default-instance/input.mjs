// Instance method with default + call init + one more instance method: triggers both
// needsMemo path (_ref = getArr()) AND inline default testRef. Verifies correct
// interaction: `const _ref = getArr(); let _ref2, at = (_ref2 = _at(_ref)) === void 0 ? alt : _ref2;
// const includes = _includes(_ref);`
const { at = alt, includes } = getArr();
