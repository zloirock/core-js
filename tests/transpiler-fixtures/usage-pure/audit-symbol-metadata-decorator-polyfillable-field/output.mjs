import _Map from "@core-js/pure/actual/map/constructor";
import _Symbol$metadata from "@core-js/pure/actual/symbol/metadata";
// stage-3 `Symbol.metadata` decorator-attached field with a polyfillable initializer:
// the initializer expression is scanned and the runtime call is rewritten.
class A {
  @log
  static field = _Map;
  static [_Symbol$metadata] = {};
}