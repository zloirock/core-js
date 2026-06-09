// a side-effecting computed key sharing its VariableDeclaration with another declarator. the polyfill is
// extracted to a preceding `const`; the key stays in the residual declarator with its value renamed.
// effect runs once, polyfill ALWAYS wins. regression: the old inline default read the native instead
const first = 1, { [(effectful(), 'from')]: from } = Array;
const probe = [1, 2].includes(2);
