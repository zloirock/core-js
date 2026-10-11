// an inherited static read off `this` or `super` in a static method binds to the pure import once the
// install of its global never runs, as a read off the global does; a static the file patches keeps its
// receiver
if (typeof Promise == 'undefined') globalThis.Promise = PromiseShim;
export class Pool extends Promise {
  static settle(list) { return this.allSettled(list); }
  static first(list) { return super.any(list); }
}
Array.from = arrayFrom;
export class List extends Array {
  static make(items) { return this.from(items); }
}
