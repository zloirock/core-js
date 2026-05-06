// resolveBindingType for `let` declared with annotation but no init then assigned and
// used in straight-line flow. findBindingAnnotation returns the declared annotation;
// `let` makes binding.constantViolations non-empty so resolveBindingType walks into
// findLastStraightLineAssignment, but the typed annotation should ALREADY win at the
// findBindingAnnotation step. distinct methods per call site
let buf: number[];
buf = [10, 20, 30];
buf.findLast(n => n > 5);
buf.at(0);
buf.includes(20);
