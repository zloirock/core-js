// arrow functions inherit `this`, so assignments inside them contribute. regular function
// expressions rebind `this` and must be skipped - collectThisFieldAssignmentTypes's traversal
// does exactly that, so the `function () { this.#v = "str"; }` below doesn't widen #v
class C {
  #v = null;
  load() { Promise.resolve([1, 2]).then(xs => { this.#v = xs; }); }
  distract() { (function () { this.#v = "str"; }).call({}); }
  first() { return this.#v?.at(0); }
}
