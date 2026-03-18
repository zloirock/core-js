import _trimMaybeString from "@core-js/pure/actual/string/instance/trim";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
function f(s: string) {
  const trim = _trimMaybeString(s);
  const includes = _includesMaybeString(s);
}