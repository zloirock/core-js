// arrow functions inherit `this` from the enclosing class method, so `this.#v = xs`
// inside the `.then(xs => ...)` arrow widens `#v` to Array. a regular function
// expression (`function () { this.#v = "str" }`) rebinds `this` to its call-site
// receiver, so it must NOT contribute `"str"` to `#v`'s inferred type
class C {
  #v = null;
  load() { Promise.resolve([1, 2]).then(xs => { this.#v = xs; }); }
  distract() { (function () { this.#v = "str"; }).call({}); }
  first() { return this.#v?.at(0); }
}
