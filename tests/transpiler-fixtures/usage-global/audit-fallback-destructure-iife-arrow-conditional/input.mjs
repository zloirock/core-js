// fallback destructure receiver wrapped in a zero-arg arrow-expression-body IIFE:
// `(() => cond ? Array : Iterator)()`. the IIFE must be peeled to reach the inner
// conditional; otherwise the CallExpression bails to a null receiver and no fallback
// branch dispatch fires. peeled, both branches (Array.from + Iterator.from) are
// enumerated and their es.* polyfills emitted.
const { from } = (() => cond ? Array : Iterator)();
from([1, 2]);
