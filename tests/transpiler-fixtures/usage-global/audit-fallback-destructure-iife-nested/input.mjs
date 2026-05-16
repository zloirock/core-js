// nested IIFE: `(() => (() => cond ? Array : Iterator)())()`. inner IIFE wraps the
// conditional, outer IIFE wraps the inner call. `peelFallbackReceiver`'s loop iterates
// to stability -- peels outer IIFE -> inner CallExpression, then peels inner IIFE ->
// ConditionalExpression. without the loop-to-stable design, only one layer would peel.
const { from } = (() => (() => cond ? Array : Iterator)())();
from([1, 2]);
