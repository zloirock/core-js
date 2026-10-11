// IIFE wrapping a LogicalExpression `&&`: `(() => Array && Iterator)()`, resolved after the IIFE peels. its
// left is a global the build serves, so it always passes and the IIFE yields its right: `Iterator.from` is
// injected and the left names no static
const { from } = (() => Array && Iterator)();
from([1, 2]);
