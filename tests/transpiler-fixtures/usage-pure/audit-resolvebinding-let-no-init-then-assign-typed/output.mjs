import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `let buf: number[]` declared without init, then assigned. the type annotation must
// drive narrowing for downstream instance methods, even though the binding has been
// reassigned (which would normally bail static-shape resolution)
let buf: number[];
buf = [10, 20, 30];
_findLastMaybeArray(buf).call(buf, n => n > 5);
_atMaybeArray(buf).call(buf, 0);
_includesMaybeArray(buf).call(buf, 20);