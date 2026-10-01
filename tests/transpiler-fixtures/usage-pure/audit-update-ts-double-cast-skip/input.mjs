// double TS cast / satisfies wrapping the increment/decrement operand: receiver is not a
// recognisable polyfill target after the wrapper chain unwraps, so `.at` / `.includes`
// instance polyfills are not injected
(obj.at! as any as unknown)++;
--(obj.includes! satisfies any as unknown);
