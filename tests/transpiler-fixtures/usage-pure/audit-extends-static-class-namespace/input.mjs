// a class used as a namespace (`class Box { static Promise = Promise }`)
// followed by `extends Box.Promise` must resolve through the static property
// to the global `Promise`, so `super.try(...)` routes through its polyfill.
class Box {
  static Promise = Promise;
}
class C extends Box.Promise {
  static run() { return super.try(() => 1); }
}
