import _URIError$isError from "@core-js/pure/actual/uri-error/is-error";
// acronym Error subclass with no pure constructor - super-static dispatch must
// still reach the polyfill through the per-class kebab head `uri-error/is-error`.
import URIErr from "@core-js/pure/actual/uri-error/constructor";
class MyURIError extends URIErr {
  static probe(x) {
    return _URIError$isError.call(this, x);
  }
}
[MyURIError.probe("hi"), new MyURIError("bad URI")];