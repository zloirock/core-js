import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includes from "@core-js/pure/actual/instance/includes";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
// Svelte SFC virtual id without an explicit `lang=` (`?svelte&type=script`) defaults to
// JS parsing. distinct instance methods per line lock per-import dispatch
_findLastMaybeArray(arr).call(arr, x => x);
_padEndMaybeString(str).call(str, 4);
_includes(buf).call(buf, 7);