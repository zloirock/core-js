import "@core-js/pure/modules/es.array.from";
import "@core-js/pure/modules/es.array.includes";
import "@core-js/pure/modules/es.array.of";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// an indirect-require core-js entry (`(prefix, require)('core-js/...')`) under a package the plugin
// manages keeps its observable prefix as statements, and the prefix is still LIVE for the usage
// sweep: the `at` calls inside it are polyfilled (a memo ref for the literal receiver included).
// keeping the prefix by point edits around the elements, not by overwriting the whole statement,
// is what lets those rewrites land - an edit inside an overwritten span is one MagicString refuses
let arr = [1];
_atMaybeArray(arr).call(arr, 0);
_atMaybeArray(_ref = [1]).call(_ref, 0);
_atMaybeArray(_ref2 = [2]).call(_ref2, 1);
export const r = arr;