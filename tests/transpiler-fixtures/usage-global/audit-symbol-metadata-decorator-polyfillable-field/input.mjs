// stage-3 `Symbol.metadata` decorator-attached field with a polyfillable initializer:
// the initializer expression is scanned and the runtime call is rewritten.
class A {
  @log static field = Map;
  static [Symbol.metadata] = {};
}
