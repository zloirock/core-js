import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includes from "@core-js/pure/actual/instance/includes";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
// the deoptionalize-needle comment-skip must consume the comment by structural boundary
// (`*/` for block comments) rather than by token scan - a comment whose body happens to
// contain `?.` would otherwise confuse a naive `?.`-counter and emit `.(` mid-comment.
// the empty block comment `/**/` is also a valid skip target. each line uses a distinct
// method to make the per-line comment-shape dispatch visible: includes / endsWith /
// flatMap; the multi-line block comment exercises the indexOf walk past `*/`
const a = arr == null ? void 0 : _includes(arr).call(arr, 1);
const b = str == null ? void 0 : _endsWithMaybeString(str).call(str, 'x');
const c = arr == null ? void 0 : _flatMapMaybeArray(arr).call(arr, _ => [_]);