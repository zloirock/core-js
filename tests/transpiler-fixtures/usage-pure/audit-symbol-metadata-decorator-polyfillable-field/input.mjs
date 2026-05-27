// stage-2.7 `Symbol.metadata` decorator-attached field with a polyfillable initializer:
// the initializer expression is scanned and the runtime call is rewritten.
// at mode=actual `Symbol.metadata` is not polyfilled (stage 2.7); falls back to Symbol constructor
class A {
  @log static field = Map;
  static [Symbol.metadata] = {};
}
