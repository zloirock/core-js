import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// string literal containing text that looks like a rewrite needle, just before the
// real rewrite site: must not trigger a spurious replacement inside the string.
_includes(arr).call(arr, "arr.at(0)", _at(arr).call(arr, 0));