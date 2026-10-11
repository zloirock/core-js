// a method's computed key runs where the class or object literal stands, not in the method: a key read
// ahead of a patch below takes the pure import. a write in a key runs before every static field, so a
// static field read after it in evaluation reads the user's slot, wherever the text puts it
export class List {
  [Symbol.iterator]() {
    return this;
  }
}
export const table = {
  get [Promise.name]() {
    return 1;
  },
};
export class Registry {
  static seen = new Set();
  [(globalThis.Set = ShimSet, 'register')]() {}
}
globalThis.Symbol = ShimSymbol;
globalThis.Promise = ShimPromise;
