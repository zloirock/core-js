import _includes from "@core-js/pure/actual/instance/includes";
// Catch + default value on an instance method: `emitCatchClause` defaultSrc branch with
// `testRef = generateRef(false)` inline: `let _testRef, includes = (_testRef = _includes(_ref)) === void 0 ? alt : _testRef;`.
// tests the generateRef hoisting guard and double-evaluation prevention.
try {
  risky();
} catch (_ref) {
let _ref2, includes = (_ref2 = _includes(_ref)) === void 0 ? alt : _ref2;
  includes;
}