// class used as namespace: `class Box { static Promise = Promise }; extends Box.Promise`.
// resolver walks the ClassDeclaration body, finds static property `Promise`, recurses on
// its value (Identifier 'Promise' -> global). `super.try(...)` routes through the polyfill
class Box {
  static Promise = Promise;
}
class C extends Box.Promise {
  static run() { return super.try(() => 1); }
}
