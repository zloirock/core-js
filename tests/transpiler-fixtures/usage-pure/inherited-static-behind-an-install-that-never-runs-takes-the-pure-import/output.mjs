import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// an inherited static read off `this` or `super` in a static method binds to the pure import once the
// install of its global never runs, as a read off the global does; a static the file patches keeps its
// receiver
if (typeof _Promise == 'undefined') _globalThis.Promise = PromiseShim;
export class Pool extends _Promise {
  static settle(list) {
    return this.allSettled(list);
  }
  static first(list) {
    return super.any(list);
  }
}
Array.from = arrayFrom;
export class List extends Array {
  static make(items) {
    return this.from(items);
  }
}