import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Exclude<T, never> keeps all members of T (TS spec). resolveExtractExclude
// resolves target via resolveAnnotationInContext; never-keyword resolves to
// $Primitive('never'). isAssignableTo: `string` vs `never` - typesEqual checks
// `type === type && constructor === constructor`, ('string' vs 'never' types
// differ), and `target.primitive` is true so the secondary path also rejects.
// All members fail isAssignableTo check, so `keep=false` -> all kept (Exclude).
type Pool = number[] | string[];
type Result = Exclude<Pool, never>;
declare const v: Result;
_atMaybeArray(v).call(v, 0);
_findLastMaybeArray(v).call(v, x => true);