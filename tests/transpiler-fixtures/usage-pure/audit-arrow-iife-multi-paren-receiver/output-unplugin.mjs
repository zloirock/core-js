import _Array$from from "@core-js/pure/actual/array/from";
// Multi-paren wrapped arrow IIFE: detectIifeArgReceiver must peel through every
// ParenthesizedExpression layer to reach the CallExpression, otherwise the synth-swap
// path bails to inline default and the receiver `Array` stays unpolyfilled at runtime.
(((({ from }) => from(1))))({ from: _Array$from });