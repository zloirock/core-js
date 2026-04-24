// `super.X` in a static-field *initializer* - runtime semantics: in a static field init,
// `this` binds to the class constructor, and `super` refs the superclass's static surface.
// The polyfill should recognize the static-field context and resolve super.allSettled as
// Promise.allSettled. `findEnclosingClassMember` treats ClassProperty with `static: true`
// the same as static methods.
class C extends Promise {
  static cached = super.allSettled([]);
  static initialized = this.allSettled([]);
}
