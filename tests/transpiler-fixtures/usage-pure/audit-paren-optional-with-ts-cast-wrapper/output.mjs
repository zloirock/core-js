import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Paren + `as any` wraps the optional member; outer call may be optional or non-optional.
// Optional outer short-circuits cleanly; non-optional outer must throw on nullish via `.call`.
declare const arr: number[];
arr == null ? void 0 : _atMaybeArray(arr)?.call(arr, 0);
(arr == null ? void 0 : _includesMaybeArray(arr)).call(arr, 1);