import "core-js/modules/es.string.at";
// IIFE with a TS-cast callee `((arrow) as any)()`. the IIFE recogniser must peel TS
// expression wrappers (and ChainExpression) on the callee side - matches the wrapper
// set used by detect-usage / synth-swap / findIifeCallSite. without the peel, the
// straight-line lift doesn't recognise this as an IIFE and the assignment stays
// classified as outer-scope mutable, leading to over-injection of both array.at and
// string.at instead of just string.at.
let x = [];
((() => {
  x = 'hello';
}) as any)();
x.at(-1);