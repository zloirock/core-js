// nested IIFE: `(() => (() => cond ? Array : Iterator)())()`. inner IIFE wraps the
// conditional, outer IIFE wraps the inner call. fallback-receiver peel iterates to
// stability -- strips outer IIFE -> inner CallExpression, then inner IIFE ->
// ConditionalExpression. without loop-to-stable, only one layer would peel.
const { from } = (() => (() => cond ? Array : Iterator)())();
from([1, 2]);
