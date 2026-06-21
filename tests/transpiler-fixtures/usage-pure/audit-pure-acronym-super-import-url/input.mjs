// `class extends MyURL` resolves super.canParse via the URL static dispatch. reverse-mapping
// `url/constructor` -> `URL` must preserve the acronym (the global key comes from compat-data);
// a kebab-only fallback would yield `Url`, miss the global, and emit no polyfill - silent
// under-injection on URL subclasses. URLSearchParams / DOMException share the path but have no
// static methods in compat-data, so URL.canParse is the only reachable repro.
import MyURL from '@core-js/pure/actual/url';
class CanonicalChecker extends MyURL {
  static probe(input) {
    return super.canParse(input);
  }
}
