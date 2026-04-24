// `super.X` / `this.X` inside a static-field initializer - at runtime, `this` binds to the
// class constructor and `super` refs the parent's static surface, the same as inside a
// static method / static block. plugin treats static fields uniformly and polyfills
// super.allSettled / this.allSettled through Promise.allSettled
class C extends Promise {
  static cached = super.allSettled([]);
  static initialized = this.allSettled([]);
}
