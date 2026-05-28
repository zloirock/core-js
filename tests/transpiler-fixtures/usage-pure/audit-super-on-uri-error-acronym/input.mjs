// acronym Error subclass with no pure constructor - super-static dispatch must
// still reach the polyfill through the per-class kebab head `uri-error/is-error`.
import URIErr from "@core-js/pure/actual/uri-error/constructor";
class MyURIError extends URIErr {
  static probe(x) {
    return super.isError(x);
  }
}
[MyURIError.probe("hi"), new MyURIError("bad URI")];
