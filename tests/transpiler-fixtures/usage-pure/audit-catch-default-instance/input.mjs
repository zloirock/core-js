// Catch + default value on an instance method: `emitCatchClause` defaultSrc branch with
// `testRef = generateRef(false)` inline: `let _testRef, includes = (_testRef = _includes(_ref)) === void 0 ? alt : _testRef;`.
// tests the generateRef hoisting guard and double-evaluation prevention.
try {
  risky();
} catch ({ includes = alt }) {
  includes;
}
