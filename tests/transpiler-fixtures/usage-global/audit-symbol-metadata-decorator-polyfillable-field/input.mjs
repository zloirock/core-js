// stage-2.7 `Symbol.metadata` decorator-attached field with a polyfillable initializer: the
// initializer is scanned through the decorator, and usage-global rewrites nothing - the lock is the
// import set, the Map family beside `esnext.symbol.metadata`
class A {
  @log static field = Map;
  static [Symbol.metadata] = {};
}
