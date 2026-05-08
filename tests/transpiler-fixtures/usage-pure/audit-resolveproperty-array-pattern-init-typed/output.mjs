import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// resolveBindingType handles ArrayPattern destructure with the annotation living on the
// init expression rather than the pattern. resolveArrayBinding walks the init's
// findExpressionAnnotation path. Each binding then resolves to a string-typed entry
// from the tuple and the chained call narrows to string-specific instance method
declare const tup: [string, string[], string];
const [first, mid, last] = tup;
_includesMaybeString(first).call(first, 'a');
_findLastMaybeArray(mid).call(mid, x => x);
_atMaybeString(last).call(last, 0);