// `class C extends URL { method() { super.X() } }` on an acronym global.
// the entry-hint index maps the kebab head `url` back to the canonical `URL`
// (with the acronym preserved) so super-method resolution finds the polyfill entry.
import URL from "@core-js/pure/actual/url";
class MyURL extends URL {
  method() {
    return super.toJSON();
  }
}
new MyURL("https://example.com/").method();
