import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includes from "@core-js/pure/actual/instance/includes";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
// the deoptionalize comment-skip must consume a comment by its structural boundary (`*/` for
// block comments), not by token scan, else a comment body containing `?.` is mistaken for a
// chain token and emits `.(` mid-comment. empty `/**/` is a valid skip target; each line uses
// a distinct method (includes / endsWith / flatMap) and the multi-line block walks past `*/`
const a = arr == null ? void 0 : _includes(arr).call(arr, 1);
const b = str == null ? void 0 : _endsWithMaybeString(str).call(str, 'x');
const c = arr == null ? void 0 : _flatMapMaybeArray(arr).call(arr, _ => [_]);