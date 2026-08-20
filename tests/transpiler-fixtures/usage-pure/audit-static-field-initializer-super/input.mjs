// `super.X` / `this.X` inside a static-field initializer - at runtime, `this` binds to the
// class constructor and `super` refs the parent's static surface, the same as inside a
// static method / static block. both are inherited-static and emit
// `_Promise$allSettled.call(this, ...)`, keeping the subclass as the constructor
class C extends Promise {
  static cached = super.allSettled([]);
  static initialized = this.allSettled([]);
}
