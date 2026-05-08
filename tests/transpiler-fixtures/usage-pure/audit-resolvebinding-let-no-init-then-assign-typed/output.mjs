import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// resolveBindingType for `let` declared with annotation but no init then assigned and
// used in straight-line flow. findBindingAnnotation returns the declared annotation;
// `let` makes binding.constantViolations non-empty so resolveBindingType walks into
// findLastStraightLineAssignment, but the typed annotation should ALREADY win at the
// findBindingAnnotation step. distinct methods per call site
let buf: number[];
buf = [10, 20, 30];
_findLastMaybeArray(buf).call(buf, n => n > 5);
_atMaybeArray(buf).call(buf, 0);
_includesMaybeArray(buf).call(buf, 20);