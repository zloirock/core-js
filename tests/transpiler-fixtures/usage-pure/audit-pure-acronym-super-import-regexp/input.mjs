// `class extends MyRegExp` resolves super.escape via the RegExp static dispatch table.
// reverse-mapping `regexp` (statics-only owner, no pure ctor) -> `RegExp` must preserve
// the acronym (data-driven lookup picks owner name from compat-data); a kebab-only
// fallback would yield `Regexp`, miss the global, and emit no polyfill - silent under-
// injection on RegExp subclasses
import MyRegExp from '@core-js/pure/actual/regexp';
class StringEscaper extends MyRegExp {
  static safe(input) {
    return super.escape(input);
  }
}
