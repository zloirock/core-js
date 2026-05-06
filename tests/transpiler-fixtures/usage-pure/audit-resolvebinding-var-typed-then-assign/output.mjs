import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// resolveBindingType for var declared with annotation but no init: the binding then
// receives a runtime assignment in straight-line flow. findBindingAnnotation returns the
// declared annotation; ?.resolveTypeAnnotation locks the array kind. methods are distinct
// to confirm each emit ties to its line via the same source binding
var arr: string[];
arr = ['x', 'y', 'z'];
_findLastMaybeArray(arr).call(arr, s => s);
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'y');