// `class C extends URL { method() { super.X() } }` exercises entryHintIndex
// data-driven path: kebabToPascal('url') would produce 'Url' (wrong); index
// maps the kebab head 'url' back to the canonical 'URL' so super-method
// resolution finds the polyfill entry
import URL from "@core-js/pure/web/url";
class MyURL extends URL {
  method() {
    return super.toJSON();
  }
}
new MyURL("https://example.com/").method();
