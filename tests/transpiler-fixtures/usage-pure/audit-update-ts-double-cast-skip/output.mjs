// double TS cast / satisfies wrapping the increment/decrement operand: receiver is not a
// recognisable polyfill target after the wrapper chain unwraps, so `.at` / `.includes`
// instance polyfills are not injected
// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
obj.at! as any as unknown++;
// @ts-expect-error an update through a cast, which tsc refuses, is the shape under test
--obj.includes! satisfies any as unknown;