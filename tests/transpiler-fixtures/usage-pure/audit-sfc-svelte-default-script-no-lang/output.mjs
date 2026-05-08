import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includes from "@core-js/pure/actual/instance/includes";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
// Svelte SFC `?svelte&type=script` without `lang=` defaults to JS via SFC_DEFAULT_JS_RE.
// liftSfcLangSuffix returns bare baseId, oxc treats `.svelte` extension as default JS.
// Each line uses a distinct prototype method to bind one polyfill per source line
_findLastMaybeArray(arr).call(arr, x => x);
_padEndMaybeString(str).call(str, 4);
_includes(buf).call(buf, 7);